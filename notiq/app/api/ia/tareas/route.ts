import { NextResponse, type NextRequest } from 'next/server';
import { completarJson } from '@/lib/ia/openai';
import { SISTEMA_TAREAS, bloqueDeContexto, hoyISO } from '@/lib/ia/prompts';
import { prepararIa, recortar, respuestaDeError } from '@/lib/ia/handler';

export const runtime = 'nodejs';

const PRIORIDADES = ['urgente', 'alta', 'normal', 'baja'];

type RespuestaModelo = {
  tareas?: { titulo?: unknown; prioridad?: unknown; vence?: unknown }[];
};

export async function POST(request: NextRequest) {
  const preparado = await prepararIa();
  if (!preparado.ok) return preparado.respuesta;

  try {
    const cuerpo = (await request.json()) as { titulo?: string; contenido?: string };
    const contenido = (cuerpo.contenido ?? '').trim();

    if (contenido.length < 40) {
      return NextResponse.json(
        { error: 'La nota es demasiado corta para sacar tareas.' },
        { status: 400 },
      );
    }

    const datos = await completarJson<RespuestaModelo>({
      mensajes: [
        { role: 'system', content: SISTEMA_TAREAS },
        {
          role: 'user',
          content: [
            `Hoy es ${hoyISO()}.`,
            `Extrae las tareas de esta nota titulada "${(cuerpo.titulo ?? 'Sin título').slice(0, 200)}".`,
            bloqueDeContexto('nota', recortar(contenido)),
          ].join('\n\n'),
        },
      ],
      temperatura: 0.1,
      maxTokens: 900,
    });

    // El JSON del modelo se valida entero: viene de fuera aunque lo hayamos pedido
    // nosotros, y de aquí sale directo a un insert.
    const tareas = (Array.isArray(datos.tareas) ? datos.tareas : [])
      .map((t) => ({
        titulo: typeof t.titulo === 'string' ? t.titulo.trim().slice(0, 200) : '',
        prioridad:
          typeof t.prioridad === 'string' && PRIORIDADES.includes(t.prioridad)
            ? t.prioridad
            : 'normal',
        vence:
          typeof t.vence === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.vence) ? t.vence : null,
      }))
      .filter((t) => t.titulo.length > 0)
      .slice(0, 12);

    return NextResponse.json({ tareas });
  } catch (fallo) {
    return respuestaDeError(fallo);
  }
}
