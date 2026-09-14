import { NextResponse, type NextRequest } from 'next/server';
import { completarJson } from '@/lib/ia/openai';
import { SISTEMA_EXAMEN, bloqueDeContexto } from '@/lib/ia/prompts';
import { prepararIa, recortar, respuestaDeError } from '@/lib/ia/handler';

export const runtime = 'nodejs';
export const maxDuration = 60;

type RespuestaModelo = {
  preguntas?: { pregunta?: unknown; opciones?: unknown; correcta?: unknown; tema?: unknown }[];
};

export async function POST(request: NextRequest) {
  const preparado = await prepararIa();
  if (!preparado.ok) return preparado.respuesta;

  try {
    const cuerpo = (await request.json()) as {
      titulo?: string;
      contenido?: string;
      numPreguntas?: number;
      dificultad?: string;
    };
    const contenido = (cuerpo.contenido ?? '').trim();

    if (contenido.length < 40) {
      return NextResponse.json(
        { error: 'Hace falta más contenido para generar un examen de aquí.' },
        { status: 400 },
      );
    }

    // Entre 5 y 30 preguntas: menos no es un examen, más no cabe en una sola
    // llamada fiable al modelo.
    const numPreguntas = Math.min(Math.max(Math.trunc(cuerpo.numPreguntas ?? 10), 5), 30);
    const dificultad = (['facil', 'media', 'dificil'] as const).includes(
      cuerpo.dificultad as 'facil' | 'media' | 'dificil',
    )
      ? cuerpo.dificultad
      : 'media';

    const datos = await completarJson<RespuestaModelo>({
      mensajes: [
        { role: 'system', content: SISTEMA_EXAMEN },
        {
          role: 'user',
          content: [
            `Genera un examen de ${numPreguntas} preguntas, dificultad ${dificultad}, sobre "${(cuerpo.titulo ?? 'este contenido').slice(0, 200)}".`,
            bloqueDeContexto('contenido', recortar(contenido)),
          ].join('\n\n'),
        },
      ],
      temperatura: 0.4,
      maxTokens: 3500,
    });

    const preguntas = (Array.isArray(datos.preguntas) ? datos.preguntas : [])
      .map((p) => {
        const opciones = Array.isArray(p.opciones)
          ? p.opciones.filter((o): o is string => typeof o === 'string').map((o) => o.trim().slice(0, 300))
          : [];
        const correcta = typeof p.correcta === 'number' ? Math.trunc(p.correcta) : -1;

        return {
          pregunta: typeof p.pregunta === 'string' ? p.pregunta.trim().slice(0, 500) : '',
          opciones,
          correcta,
          tema: typeof p.tema === 'string' ? p.tema.trim().slice(0, 60) : 'General',
        };
      })
      // Una pregunta sin 4 opciones o con "correcta" fuera de rango no es una
      // pregunta válida — mejor descartarla que dejar un examen que no se puede
      // corregir bien.
      .filter((p) => p.pregunta && p.opciones.length === 4 && p.correcta >= 0 && p.correcta <= 3)
      .slice(0, numPreguntas);

    if (preguntas.length === 0) {
      return NextResponse.json(
        { error: 'No se ha podido generar un examen válido de este contenido.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ preguntas });
  } catch (fallo) {
    return respuestaDeError(fallo);
  }
}
