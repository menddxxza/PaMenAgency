'use server';

import { revalidatePath } from 'next/cache';
import { getSesion } from '@/lib/sesion';
import { db, esUuid } from '@/lib/db';
import { verificarCarpetaPropia } from '@/lib/carpetas';
import { fechaValidaONull } from '@/lib/tareas';

export type Resultado = { ok: true } | { ok: false; error: string };

const ESTADOS_FLASHCARD = ['nueva', 'repasar', 'progreso', 'dominada'] as const;
type EstadoFlashcard = (typeof ESTADOS_FLASHCARD)[number];

export type FlashcardResumen = {
  id: string;
  pregunta: string;
  respuesta: string;
  estado: EstadoFlashcard;
  folder_id: string | null;
};

// ---------------------------------------------------------------------------
// Flashcards
// ---------------------------------------------------------------------------

/** Inserta las flashcards que ha devuelto /api/ia/flashcards, o las que salen de
 * los fallos de un examen (ver crearFlashcardsDeErrores). */
export async function guardarFlashcards(
  tarjetas: { pregunta: string; respuesta: string }[],
  opciones: { folderId?: string; noteId?: string } = {},
): Promise<Resultado & { creadas?: number }> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };

  const sql = db();
  const folderId = opciones.folderId ? await verificarCarpetaPropia(sesion.userId, opciones.folderId) : null;

  let noteId: string | null = null;
  if (opciones.noteId && esUuid(opciones.noteId)) {
    const [nota] = await sql<{ id: string }[]>`
      select id from notes where id = ${opciones.noteId}::uuid and user_id = ${sesion.userId}::uuid
    `;
    noteId = nota?.id ?? null;
  }

  const limpias = tarjetas
    .map((t) => ({ pregunta: t.pregunta.trim().slice(0, 500), respuesta: t.respuesta.trim().slice(0, 2000) }))
    .filter((t) => t.pregunta.length > 0 && t.respuesta.length > 0)
    .slice(0, 15);

  if (limpias.length === 0) return { ok: true, creadas: 0 };

  try {
    await sql.begin((tx) =>
      Promise.all(
        limpias.map(
          (t) => tx`
            insert into flashcards (user_id, folder_id, note_id, pregunta, respuesta)
            values (${sesion.userId}::uuid, ${folderId}::uuid, ${noteId}::uuid, ${t.pregunta}, ${t.respuesta})
          `,
        ),
      ),
    );
  } catch (fallo) {
    console.error('[notiq] no se han podido guardar las flashcards', fallo);
    return { ok: false, error: 'No se han podido guardar las flashcards.' };
  }

  revalidatePath('/estudio');
  return { ok: true, creadas: limpias.length };
}

export async function obtenerFlashcards(folderId?: string): Promise<FlashcardResumen[] | null> {
  const sesion = await getSesion();
  if (!sesion) return null;

  const sql = db();
  if (folderId && esUuid(folderId)) {
    return sql<FlashcardResumen[]>`
      select id, pregunta, respuesta, estado, folder_id from flashcards
      where user_id = ${sesion.userId}::uuid and folder_id = ${folderId}::uuid
      order by created_at desc
    `;
  }
  return sql<FlashcardResumen[]>`
    select id, pregunta, respuesta, estado, folder_id from flashcards
    where user_id = ${sesion.userId}::uuid
    order by created_at desc
    limit 300
  `;
}

/** Las que tocan hoy: falladas primero, luego en progreso atrasadas, luego
 * nuevas — capadas a 15 para que "repaso de hoy" no se convierta en un examen. */
export async function obtenerRepasoDeHoy(): Promise<FlashcardResumen[] | null> {
  const sesion = await getSesion();
  if (!sesion) return null;

  const sql = db();
  return sql<FlashcardResumen[]>`
    select id, pregunta, respuesta, estado, folder_id from flashcards
    where user_id = ${sesion.userId}::uuid and repasar_el <= current_date
    order by
      case estado when 'repasar' then 0 when 'progreso' then 1 when 'nueva' then 2 else 3 end,
      repasar_el
    limit 15
  `;
}

/**
 * Repetición espaciada simple, no el algoritmo SM-2 completo: acertar aleja la
 * tarjeta en el tiempo y la sube un escalón (nueva/repasar → progreso →
 * dominada); fallar la manda directa a "repasar" y a hoy, sin más cálculo — es
 * lo que hace que un fallo aparezca ya en el próximo "repaso de hoy".
 */
const DIAS_SIGUIENTE: Record<EstadoFlashcard, number> = {
  nueva: 3,
  repasar: 3,
  progreso: 14,
  dominada: 30,
};
const ESTADO_SIGUIENTE: Record<EstadoFlashcard, EstadoFlashcard> = {
  nueva: 'progreso',
  repasar: 'progreso',
  progreso: 'dominada',
  dominada: 'dominada',
};

export async function responderFlashcard(id: string, acierto: boolean): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(id)) return { ok: false, error: 'Flashcard no válida.' };

  const sql = db();
  const [tarjeta] = await sql<{ estado: EstadoFlashcard }[]>`
    select estado from flashcards where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
  `;
  if (!tarjeta) return { ok: false, error: 'Esa flashcard ya no está disponible.' };

  const estadoSiguiente = acierto ? ESTADO_SIGUIENTE[tarjeta.estado] : 'repasar';
  const dias = acierto ? DIAS_SIGUIENTE[tarjeta.estado] : 0;

  try {
    await sql`
      update flashcards
      set estado = ${estadoSiguiente},
        veces_repasada = veces_repasada + 1,
        veces_fallada = veces_fallada + ${acierto ? 0 : 1},
        repasar_el = current_date + ${dias}::int
      where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
    `;
  } catch (fallo) {
    console.error('[notiq] no se ha podido actualizar la flashcard', fallo);
    return { ok: false, error: 'No se ha podido actualizar.' };
  }

  revalidatePath('/estudio');
  return { ok: true };
}

export async function borrarFlashcard(id: string): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(id)) return { ok: false, error: 'Flashcard no válida.' };

  const sql = db();
  try {
    await sql`delete from flashcards where id = ${id}::uuid and user_id = ${sesion.userId}::uuid`;
  } catch (fallo) {
    console.error('[notiq] no se ha podido borrar la flashcard', fallo);
    return { ok: false, error: 'No se ha podido borrar.' };
  }
  revalidatePath('/estudio');
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Exámenes
// ---------------------------------------------------------------------------

export type PreguntaExamen = { pregunta: string; opciones: string[]; correcta: number; tema: string };

export async function crearExamen(
  titulo: string,
  preguntas: PreguntaExamen[],
  folderId?: string,
): Promise<Resultado & { id?: string }> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (preguntas.length === 0) return { ok: false, error: 'El examen no tiene preguntas.' };

  const folderIdPropia = folderId ? await verificarCarpetaPropia(sesion.userId, folderId) : null;

  const sql = db();
  try {
    const [fila] = await sql<{ id: string }[]>`
      insert into examenes (user_id, folder_id, titulo, preguntas)
      values (
        ${sesion.userId}::uuid, ${folderIdPropia}::uuid,
        ${titulo.trim().slice(0, 200) || 'Examen sin título'}, ${JSON.stringify(preguntas)}::jsonb
      )
      returning id
    `;
    revalidatePath('/estudio');
    return { ok: true, id: fila.id };
  } catch (fallo) {
    console.error('[notiq] no se ha podido crear el examen', fallo);
    return { ok: false, error: 'No se ha podido crear el examen.' };
  }
}

export type ExamenResumen = {
  id: string;
  titulo: string;
  total_preguntas: number;
  created_at: string;
  mejor_puntuacion: number | null;
};

export async function obtenerExamenes(): Promise<ExamenResumen[] | null> {
  const sesion = await getSesion();
  if (!sesion) return null;

  const sql = db();
  return sql<ExamenResumen[]>`
    select
      e.id, e.titulo, jsonb_array_length(e.preguntas) as total_preguntas, e.created_at,
      (select max(i.puntuacion) from intentos_examen i where i.examen_id = e.id) as mejor_puntuacion
    from examenes e
    where e.user_id = ${sesion.userId}::uuid
    order by e.created_at desc
    limit 50
  `;
}

export type ExamenCompleto = { id: string; titulo: string; preguntas: PreguntaExamen[] };

export async function obtenerExamen(id: string): Promise<ExamenCompleto | null> {
  const sesion = await getSesion();
  if (!sesion) return null;
  if (!esUuid(id)) return null;

  const sql = db();
  const [examen] = await sql<ExamenCompleto[]>`
    select id, titulo, preguntas from examenes where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
  `;
  return examen ?? null;
}

export async function borrarExamen(id: string): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(id)) return { ok: false, error: 'Examen no válido.' };

  const sql = db();
  try {
    await sql`delete from examenes where id = ${id}::uuid and user_id = ${sesion.userId}::uuid`;
  } catch (fallo) {
    console.error('[notiq] no se ha podido borrar el examen', fallo);
    return { ok: false, error: 'No se ha podido borrar.' };
  }
  revalidatePath('/estudio');
  return { ok: true };
}

export type ResultadoIntento = {
  intentoId: string;
  puntuacion: number;
  total: number;
  porTema: { tema: string; fallos: number; total: number }[];
};

export type ResultadoDeIntento = ({ ok: true } & ResultadoIntento) | { ok: false; error: string };

/** Corrige el intento en el servidor (nunca te fías de la puntuación que
 * calculase el cliente) y lo deja guardado para poder repasar los fallos luego. */
export async function guardarIntento(
  examenId: string,
  respuestas: (number | null)[],
): Promise<ResultadoDeIntento> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(examenId)) return { ok: false, error: 'Examen no válido.' };

  const sql = db();
  const [examen] = await sql<{ preguntas: PreguntaExamen[] }[]>`
    select preguntas from examenes where id = ${examenId}::uuid and user_id = ${sesion.userId}::uuid
  `;
  if (!examen) return { ok: false, error: 'Ese examen ya no está disponible.' };

  const preguntas = examen.preguntas;
  const puntuacion = preguntas.reduce((acc, p, i) => acc + (respuestas[i] === p.correcta ? 1 : 0), 0);

  const porTemaMapa = new Map<string, { fallos: number; total: number }>();
  preguntas.forEach((p, i) => {
    const actual = porTemaMapa.get(p.tema) ?? { fallos: 0, total: 0 };
    actual.total += 1;
    if (respuestas[i] !== p.correcta) actual.fallos += 1;
    porTemaMapa.set(p.tema, actual);
  });
  const porTema = [...porTemaMapa.entries()]
    .map(([tema, datos]) => ({ tema, ...datos }))
    .sort((a, b) => b.fallos / b.total - a.fallos / a.total);

  try {
    const [fila] = await sql<{ id: string }[]>`
      insert into intentos_examen (user_id, examen_id, respuestas, puntuacion, total)
      values (
        ${sesion.userId}::uuid, ${examenId}::uuid, ${JSON.stringify(respuestas)}::jsonb,
        ${puntuacion}, ${preguntas.length}
      )
      returning id
    `;
    return { ok: true, intentoId: fila.id, puntuacion, total: preguntas.length, porTema };
  } catch (fallo) {
    console.error('[notiq] no se ha podido guardar el intento de examen', fallo);
    return { ok: false, error: 'No se ha podido guardar el resultado.' };
  }
}

/** El botón "Repasar mis errores": convierte las preguntas falladas del último
 * intento en flashcards — sin otra llamada a la IA, la respuesta correcta ya
 * estaba en el examen. */
export async function crearFlashcardsDeErrores(intentoId: string): Promise<Resultado & { creadas?: number }> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(intentoId)) return { ok: false, error: 'Intento no válido.' };

  const sql = db();
  const [intento] = await sql<{ respuestas: (number | null)[]; examen_id: string }[]>`
    select respuestas, examen_id from intentos_examen
    where id = ${intentoId}::uuid and user_id = ${sesion.userId}::uuid
  `;
  if (!intento) return { ok: false, error: 'Ese intento ya no está disponible.' };

  const [examen] = await sql<{ preguntas: PreguntaExamen[]; folder_id: string | null }[]>`
    select preguntas, folder_id from examenes
    where id = ${intento.examen_id}::uuid and user_id = ${sesion.userId}::uuid
  `;
  if (!examen) return { ok: false, error: 'Ese examen ya no está disponible.' };

  const fallos = examen.preguntas.filter((p, i) => intento.respuestas[i] !== p.correcta);
  if (fallos.length === 0) return { ok: true, creadas: 0 };

  try {
    await sql.begin((tx) =>
      Promise.all(
        fallos.map(
          (p) => tx`
            insert into flashcards (user_id, folder_id, pregunta, respuesta)
            values (
              ${sesion.userId}::uuid, ${examen.folder_id}::uuid,
              ${p.pregunta.slice(0, 500)}, ${p.opciones[p.correcta].slice(0, 2000)}
            )
          `,
        ),
      ),
    );
  } catch (fallo) {
    console.error('[notiq] no se han podido crear flashcards de los errores', fallo);
    return { ok: false, error: 'No se han podido crear las flashcards.' };
  }

  revalidatePath('/estudio');
  return { ok: true, creadas: fallos.length };
}

// ---------------------------------------------------------------------------
// Progreso y carga inicial de la pestaña
// ---------------------------------------------------------------------------

export type ProgresoCarpeta = {
  id: string;
  nombre: string;
  nueva: number;
  repasar: number;
  progreso: number;
  dominada: number;
};

/**
 * Fecha de examen de una carpeta — lo que activa el "modo examen" en
 * SeccionEstudio.tsx. `fecha: null` la borra (para cuando el examen ya pasó,
 * o se puso por error).
 */
export async function guardarFechaExamen(folderId: string, fecha: string | null): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };

  const folderIdPropia = await verificarCarpetaPropia(sesion.userId, folderId);
  if (!folderIdPropia) return { ok: false, error: 'Carpeta no válida.' };

  const fechaValida = fecha ? fechaValidaONull(fecha) : null;
  if (fecha && !fechaValida) return { ok: false, error: 'Fecha no válida.' };

  const sql = db();
  try {
    await sql`
      update folders set fecha_examen = ${fechaValida} where id = ${folderIdPropia}::uuid
    `;
  } catch (fallo) {
    console.error('[notiq] no se ha podido guardar la fecha de examen', fallo);
    return { ok: false, error: 'No se ha podido guardar.' };
  }

  revalidatePath('/estudio');
  return { ok: true };
}

export type CarpetaEstudio = { id: string; nombre: string; fecha_examen: string | null };

export type EstudioInicial = {
  carpetas: CarpetaEstudio[];
  repasoDeHoy: FlashcardResumen[];
  examenes: ExamenResumen[];
  progreso: ProgresoCarpeta[];
};

/** Todo lo que pinta la pestaña Estudio al abrirla, en una sola llamada —
 * mismo patrón que obtenerResumen() en inicio/actions.ts. */
export async function obtenerEstudioInicial(): Promise<EstudioInicial | null> {
  const sesion = await getSesion();
  if (!sesion) return null;

  const sql = db();
  const [carpetas, repasoDeHoy, examenes, filasProgreso] = await Promise.all([
    sql<CarpetaEstudio[]>`
      select id, nombre, fecha_examen::text from folders
      where user_id = ${sesion.userId}::uuid order by nombre
    `,
    obtenerRepasoDeHoy(),
    obtenerExamenes(),
    sql<{ folder_id: string | null; nombre: string | null; estado: EstadoFlashcard; total: number }[]>`
      select f.folder_id, fo.nombre, f.estado, count(*)::int as total
      from flashcards f
      left join folders fo on fo.id = f.folder_id
      where f.user_id = ${sesion.userId}::uuid
      group by f.folder_id, fo.nombre, f.estado
    `,
  ]);

  const porCarpeta = new Map<string, ProgresoCarpeta>();
  for (const fila of filasProgreso) {
    if (!fila.folder_id) continue;
    const actual =
      porCarpeta.get(fila.folder_id) ??
      { id: fila.folder_id, nombre: fila.nombre ?? 'Sin nombre', nueva: 0, repasar: 0, progreso: 0, dominada: 0 };
    actual[fila.estado] += fila.total;
    porCarpeta.set(fila.folder_id, actual);
  }

  return {
    carpetas,
    repasoDeHoy: repasoDeHoy ?? [],
    examenes: examenes ?? [],
    progreso: [...porCarpeta.values()],
  };
}
