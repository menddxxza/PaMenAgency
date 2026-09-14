import { NextResponse, type NextRequest } from 'next/server';
import { completarJson } from '@/lib/ia/openai';
import { SISTEMA_FLASHCARDS, bloqueDeContexto } from '@/lib/ia/prompts';
import { prepararIa, recortar, respuestaDeError } from '@/lib/ia/handler';

export const runtime = 'nodejs';
export const maxDuration = 60;

type RespuestaModelo = {
  flashcards?: { pregunta?: unknown; respuesta?: unknown }[];
};

export async function POST(request: NextRequest) {
  const preparado = await prepararIa();
  if (!preparado.ok) return preparado.respuesta;

  try {
    const cuerpo = (await request.json()) as { titulo?: string; contenido?: string };
    const contenido = (cuerpo.contenido ?? '').trim();

    if (contenido.length < 40) {
      return NextResponse.json(
        { error: 'Hace falta más contenido para sacar flashcards de aquí.' },
        { status: 400 },
      );
    }

    const datos = await completarJson<RespuestaModelo>({
      mensajes: [
        { role: 'system', content: SISTEMA_FLASHCARDS },
        {
          role: 'user',
          content: [
            `Saca flashcards de "${(cuerpo.titulo ?? 'este contenido').slice(0, 200)}".`,
            bloqueDeContexto('contenido', recortar(contenido)),
          ].join('\n\n'),
        },
      ],
      temperatura: 0.3,
      maxTokens: 2000,
    });

    // Igual que en tareas/route.ts: el JSON del modelo se valida entero antes de
    // que salga de aquí, porque de aquí sale directo a un insert.
    const flashcards = (Array.isArray(datos.flashcards) ? datos.flashcards : [])
      .map((f) => ({
        pregunta: typeof f.pregunta === 'string' ? f.pregunta.trim().slice(0, 500) : '',
        respuesta: typeof f.respuesta === 'string' ? f.respuesta.trim().slice(0, 2000) : '',
      }))
      .filter((f) => f.pregunta.length > 0 && f.respuesta.length > 0)
      .slice(0, 15);

    return NextResponse.json({ flashcards });
  } catch (fallo) {
    return respuestaDeError(fallo);
  }
}
