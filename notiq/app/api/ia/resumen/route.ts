import { NextResponse, type NextRequest } from 'next/server';
import { completar } from '@/lib/ia/openai';
import { SISTEMA_RESUMEN, bloqueDeContexto } from '@/lib/ia/prompts';
import { prepararIa, recortar, respuestaDeError } from '@/lib/ia/handler';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const preparado = await prepararIa();
  if (!preparado.ok) return preparado.respuesta;

  try {
    const cuerpo = (await request.json()) as { titulo?: string; contenido?: string };
    const contenido = (cuerpo.contenido ?? '').trim();

    if (contenido.length < 40) {
      return NextResponse.json(
        { error: 'La nota es demasiado corta para resumirla.' },
        { status: 400 },
      );
    }

    const resumen = await completar({
      mensajes: [
        { role: 'system', content: SISTEMA_RESUMEN },
        {
          role: 'user',
          content: [
            `Resume esta nota titulada "${(cuerpo.titulo ?? 'Sin título').slice(0, 200)}".`,
            bloqueDeContexto('nota', recortar(contenido)),
          ].join('\n\n'),
        },
      ],
      maxTokens: 600,
    });

    return NextResponse.json({ resumen });
  } catch (fallo) {
    return respuestaDeError(fallo);
  }
}
