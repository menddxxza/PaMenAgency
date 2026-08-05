import { NextResponse, type NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { completar, type Mensaje } from '@/lib/ia/openai';
import { SISTEMA_ASISTENTE, bloqueDeContexto, hoyISO } from '@/lib/ia/prompts';
import { prepararIa, respuestaDeError } from '@/lib/ia/handler';

export const runtime = 'nodejs';

/** Notas que se meten en el contexto. Más no cabe sin disparar el coste por pregunta. */
const MAX_NOTAS = 6;
const MAX_CARACTERES_NOTA = 2_000;
/** Turnos previos que se reenvían. El resto se descarta. */
const MAX_HISTORIAL = 8;

type CuerpoPeticion = {
  pregunta?: string;
  historial?: { role?: unknown; content?: unknown }[];
};

export async function POST(request: NextRequest) {
  const preparado = await prepararIa();
  if (!preparado.ok) return preparado.respuesta;

  const { supabase, userId } = preparado.sesion;

  try {
    const cuerpo = (await request.json()) as CuerpoPeticion;
    const pregunta = (cuerpo.pregunta ?? '').trim().slice(0, 1_000);

    if (!pregunta) {
      return NextResponse.json({ error: 'Escribe una pregunta.' }, { status: 400 });
    }

    const contexto = await reunirContexto(supabase, userId, pregunta);

    const historial: Mensaje[] = (cuerpo.historial ?? [])
      .filter(
        (m): m is { role: 'user' | 'assistant'; content: string } =>
          (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string',
      )
      .slice(-MAX_HISTORIAL)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2_000) }));

    const respuesta = await completar({
      mensajes: [
        { role: 'system', content: SISTEMA_ASISTENTE },
        ...historial,
        {
          role: 'user',
          content: [
            `Hoy es ${hoyISO()}.`,
            contexto,
            `Pregunta: ${pregunta}`,
          ].join('\n\n'),
        },
      ],
      temperatura: 0.4,
      maxTokens: 800,
    });

    return NextResponse.json({ respuesta });
  } catch (fallo) {
    return respuestaDeError(fallo);
  }
}

/**
 * Contexto que ve el asistente: las notas relevantes para la pregunta y las tareas
 * abiertas.
 *
 * La recuperación es full-text, no vectorial. Con el volumen de una cuenta personal
 * `websearch_to_tsquery` acierta lo suficiente y evita mantener embeddings al día en
 * cada tecla del editor. Si la búsqueda no devuelve nada (pregunta genérica del tipo
 * "resume mi semana"), se cae a las notas recientes, que es justo lo que se pide.
 */
async function reunirContexto(
  supabase: SupabaseClient,
  userId: string,
  pregunta: string,
): Promise<string> {
  const { data: relevantes } = await supabase.rpc('buscar_notas', {
    p_consulta: pregunta,
    p_limite: MAX_NOTAS,
  });

  let notas = (relevantes ?? []) as { titulo: string; texto: string; updated_at: string }[];

  if (notas.length === 0) {
    const { data: recientes } = await supabase
      .from('notes')
      .select('titulo, texto, updated_at')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(MAX_NOTAS);
    notas = recientes ?? [];
  }

  const { data: tareas } = await supabase
    .from('tasks')
    .select('titulo, estado, prioridad, vence')
    .eq('user_id', userId)
    .neq('estado', 'hecha')
    .order('vence', { ascending: true, nullsFirst: false })
    .limit(40);

  const bloqueNotas = notas.length
    ? notas
        .map((n) => {
          const fecha = new Date(n.updated_at).toISOString().slice(0, 10);
          const texto = (n.texto ?? '').slice(0, MAX_CARACTERES_NOTA);
          return `## ${n.titulo || 'Sin título'} (${fecha})\n${texto}`;
        })
        .join('\n\n')
    : 'El usuario todavía no tiene notas.';

  const bloqueTareas = tareas?.length
    ? tareas
        .map(
          (t) =>
            `- ${t.titulo} · ${t.estado} · prioridad ${t.prioridad}${t.vence ? ` · vence ${t.vence}` : ''}`,
        )
        .join('\n')
    : 'No hay tareas pendientes.';

  return [
    bloqueDeContexto('notas', bloqueNotas),
    bloqueDeContexto('tareas_pendientes', bloqueTareas),
  ].join('\n\n');
}
