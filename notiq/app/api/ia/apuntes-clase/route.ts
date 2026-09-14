import { NextResponse, type NextRequest } from 'next/server';
import { completar } from '@/lib/ia/openai';
import { SISTEMA_APUNTES_CLASE, bloqueDeContexto } from '@/lib/ia/prompts';
import { prepararIa, recortar, respuestaDeError } from '@/lib/ia/handler';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const preparado = await prepararIa();
  if (!preparado.ok) return preparado.respuesta;

  try {
    const cuerpo = (await request.json()) as { transcripcion?: string };
    const transcripcion = (cuerpo.transcripcion ?? '').trim();

    if (transcripcion.length < 40) {
      return NextResponse.json(
        { error: 'La transcripción es demasiado corta para sacar apuntes.' },
        { status: 400 },
      );
    }

    const apuntes = await completar({
      mensajes: [
        { role: 'system', content: SISTEMA_APUNTES_CLASE },
        {
          role: 'user',
          content: [
            'Convierte esta transcripción de clase en apuntes.',
            bloqueDeContexto('transcripcion', recortar(transcripcion)),
          ].join('\n\n'),
        },
      ],
      temperatura: 0.3,
      maxTokens: 2500,
    });

    return NextResponse.json({ apuntes });
  } catch (fallo) {
    return respuestaDeError(fallo);
  }
}
