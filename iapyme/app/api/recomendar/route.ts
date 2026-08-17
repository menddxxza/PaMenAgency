import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/public';
import { preguntarGroq } from '@/lib/groq';
import { excedeLimite, obtenerIp } from '@/lib/security/rate-limit';
import { precioResumido } from '@/lib/formato';
import type { ProductoConRelaciones } from '@/lib/database.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SELECT_CATALOGO = `
  slug, titulo, tagline, problema, solucion,
  pricing_model, precio_setup, precio_mensual, precio_unico,
  categories ( nombre )
`;

function catalogoComoTexto(productos: ProductoConRelaciones[]): string {
  return productos
    .map((p) => {
      const precio = precioResumido(p);
      return `- slug: ${p.slug} | ${p.titulo} (${p.categories?.nombre ?? 'sin categoría'}) — ${p.tagline}. Problema que resuelve: ${p.problema}. Precio: ${precio.principal}${precio.secundario ? ` ${precio.secundario}` : ''}.`;
    })
    .join('\n');
}

export async function POST(request: Request) {
  if (excedeLimite(obtenerIp(request), 8, 60_000)) {
    return NextResponse.json(
      { error: 'Demasiadas preguntas seguidas, prueba en un minuto.' },
      { status: 429 },
    );
  }

  let cuerpo: { consulta?: unknown };
  try {
    cuerpo = (await request.json()) as { consulta?: unknown };
  } catch {
    return NextResponse.json({ error: 'Petición inválida.' }, { status: 400 });
  }

  const consulta = typeof cuerpo.consulta === 'string' ? cuerpo.consulta.trim().slice(0, 300) : '';
  if (consulta.length < 3) {
    return NextResponse.json({ error: 'Cuéntame un poco más qué quieres automatizar.' }, { status: 400 });
  }

  const supabase = createPublicClient();
  if (!supabase) {
    return NextResponse.json({
      respuesta: 'El catálogo todavía no está conectado, así que no puedo comparar productos ahora mismo.',
      productos: [],
    });
  }

  const { data } = await supabase
    .from('products')
    .select(SELECT_CATALOGO)
    .eq('status', 'published')
    .limit(60);

  const productos = (data ?? []) as unknown as ProductoConRelaciones[];

  if (productos.length === 0) {
    return NextResponse.json({
      respuesta: 'Todavía no hay soluciones publicadas en el catálogo para poder recomendarte una.',
      productos: [],
    });
  }

  const systemPrompt = `Eres el asistente de compra de IAPyme, un marketplace de soluciones de IA para pymes en español. Actúas como un consultor de tecnología profesional y honesto — no como un buscador que enlaza lo primero que se parece.

Antes de responder, analiza con calma lo que cuenta el usuario: a qué se dedica, qué tarea concreta quiere automatizar, y qué necesitaría de verdad para resolverla. No te quedes en las palabras sueltas de la consulta, entiende el problema de fondo.

Después, revisa el catálogo de abajo con criterio. Un producto solo cuenta como recomendación si resuelve ese problema concreto — coincidir solo en formato (web, bot, automatización...) sin coincidir en el sector o la tarea NO es un encaje real. Por ejemplo, si piden algo para gestionar citas de una clínica, sirve un producto de salud o de gestión de citas; NO sirve una web genérica para cualquier negocio ni un chatbot pensado para ecommerce, aunque sea "lo más parecido" que haya.

Si hay dos opciones del catálogo que encajan de verdad y se complementan o resuelven ángulos distintos del mismo problema, puedes mencionar las dos y explicar en qué se diferencian, para que decida con más criterio. Nunca menciones más de dos, y nunca fuerces una segunda opción de relleno solo por completar.

Sé exigente: recomendar algo que no encaja de verdad es peor que no recomendar nada, porque hace perder el tiempo a quien confía en tu respuesta. Si ninguna opción sirve de verdad, dilo con total honestidad en vez de forzar la menos mala.

Nunca inventes productos que no estén en la lista.

Responde en español, con tono profesional, cercano y directo — como alguien que ha entendido de verdad el problema, no un script. Entre 3 y 6 frases: explica el porqué de tu respuesta, no solo el qué.
- Si hay encaje real, explica concretamente por qué esa opción (o esas dos) resuelve su problema.
- Si no lo hay, dilo con claridad (por ejemplo: "Ahora mismo no tenemos ninguna solución pensada para clínicas") y anímale a mirar el catálogo completo o, si vende soluciones de IA, a publicar la primera para ese sector.

Termina SIEMPRE tu respuesta con una última línea, exactamente en uno de estos formatos (sin nada más en esa línea):
RECOMENDADOS: <slug1>
RECOMENDADOS: <slug1>, <slug2>
RECOMENDADOS: ninguno

Catálogo disponible:
${catalogoComoTexto(productos)}`;

  const respuestaIA = await preguntarGroq([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: consulta },
  ]);

  if (!respuestaIA) {
    return NextResponse.json({
      respuesta: 'El asistente no está disponible ahora mismo. Prueba a buscar directamente en el catálogo.',
      productos: [],
    });
  }

  // Separamos la línea "RECOMENDADOS: <slug1>, <slug2>" del resto del texto
  // para mostrar el mensaje limpio y, si aplica, enlazar las fichas de verdad.
  const lineas = respuestaIA.split('\n');
  const indiceRecomendados = lineas.findIndex((l) => l.trim().toUpperCase().startsWith('RECOMENDADOS:'));
  let mensaje = respuestaIA;
  let slugsRecomendados: string[] = [];

  if (indiceRecomendados !== -1) {
    const lista = lineas[indiceRecomendados].split(':')[1]?.trim() ?? '';
    slugsRecomendados =
      lista.toLowerCase() === 'ninguno'
        ? []
        : lista
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 2);
    mensaje = lineas.slice(0, indiceRecomendados).join('\n').trim();
  }

  // Los slugs los dice el modelo: solo aceptamos los que son de verdad
  // nuestros, para que no se pueda colar un enlace inventado.
  const productosRecomendados = slugsRecomendados
    .map((slug) => productos.find((p) => p.slug === slug))
    .filter((p): p is ProductoConRelaciones => Boolean(p))
    .map((p) => ({ slug: p.slug, titulo: p.titulo }));

  return NextResponse.json({
    respuesta: mensaje || respuestaIA,
    productos: productosRecomendados,
  });
}
