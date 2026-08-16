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
      producto: null,
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
      producto: null,
    });
  }

  const systemPrompt = `Eres el asistente de compra de IAPyme, un marketplace de soluciones de IA para pymes en español.

Tu única tarea: leer lo que el usuario quiere automatizar y recomendarle UNA sola opción del catálogo de abajo, la que mejor encaje. Nunca inventes productos que no estén en la lista. Si de verdad ninguna encaja, dilo con honestidad.

Responde en español, en 2-4 frases, cercano y directo, explicando por qué esa opción encaja con lo que pidió.

Termina SIEMPRE tu respuesta con una última línea, exactamente en este formato (sin nada más en esa línea):
RECOMENDADO: <slug-del-producto>
o, si ninguna encaja de verdad:
RECOMENDADO: ninguno

Catálogo disponible:
${catalogoComoTexto(productos)}`;

  const respuestaIA = await preguntarGroq([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: consulta },
  ]);

  if (!respuestaIA) {
    return NextResponse.json({
      respuesta: 'El asistente no está disponible ahora mismo. Prueba a buscar directamente en el catálogo.',
      producto: null,
    });
  }

  // Separamos la línea "RECOMENDADO: <slug>" del resto del texto para
  // mostrar el mensaje limpio y, si aplica, enlazar la ficha de verdad.
  const lineas = respuestaIA.split('\n');
  const indiceRecomendado = lineas.findIndex((l) => l.trim().toUpperCase().startsWith('RECOMENDADO:'));
  let mensaje = respuestaIA;
  let slugRecomendado: string | null = null;

  if (indiceRecomendado !== -1) {
    const slug = lineas[indiceRecomendado].split(':')[1]?.trim();
    slugRecomendado = slug && slug !== 'ninguno' ? slug : null;
    mensaje = lineas.slice(0, indiceRecomendado).join('\n').trim();
  }

  // El slug lo dice el modelo: solo lo aceptamos si es de verdad uno de
  // nuestros productos, para que no se pueda colar un enlace inventado.
  const producto = slugRecomendado
    ? productos.find((p) => p.slug === slugRecomendado)
    : undefined;

  return NextResponse.json({
    respuesta: mensaje || respuestaIA,
    producto: producto ? { slug: producto.slug, titulo: producto.titulo } : null,
  });
}
