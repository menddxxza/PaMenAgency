'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSesion } from '@/lib/sesion';
import { db, esUuid } from '@/lib/db';
import { puedeCrearNota } from '@/lib/ia/limites';
import { fechaValidaONull } from '@/lib/tareas';
import { aTextoPlano, comoBloques, type Bloque } from '@/lib/bloques';
import { limitesDe } from '@/lib/planes';
import { verificarCarpetaPropia } from '@/lib/carpetas';
import { etiquetasDeNota, ponerEtiquetas } from '@/lib/etiquetas';

export type Resultado = { ok: true } | { ok: false; error: string };

// TEMPORAL — cazando el bug de la nota que se vacía sola. Se borra (y la
// tabla debug_log con él) en cuanto se encuentre la causa.
async function registrarDepuracion(etiqueta: string, datos: unknown) {
  try {
    const sql = db();
    await sql`insert into debug_log (etiqueta, datos) values (${etiqueta}, ${JSON.stringify(datos)}::jsonb)`;
  } catch {
    // Nunca debe romper el flujo real por un fallo del propio registro.
  }
}

/**
 * Igual que `crearNota`, pero para el panel único: en vez de redirigir a
 * `/notas/{id}` (lo que sacaría de la pantalla), devuelve el id para que el
 * panel abra el editor en el sitio.
 */
export async function crearNotaEnPanel(folderId?: string): Promise<Resultado & { id?: string }> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada. Vuelve a entrar.' };

  const cupo = await puedeCrearNota(sesion.userId, sesion.plan);
  if (!cupo.permitido) {
    return { ok: false, error: `Límite de ${cupo.limite} notas del plan alcanzado.` };
  }

  const folderIdPropia = folderId ? await verificarCarpetaPropia(sesion.userId, folderId) : null;

  const sql = db();
  try {
    const [fila] = await sql<{ id: string }[]>`
      insert into notes (user_id, titulo, content, texto, folder_id)
      values (${sesion.userId}::uuid, '', '[]'::jsonb, '', ${folderIdPropia}::uuid)
      returning id
    `;
    revalidatePath('/notas');
    return { ok: true, id: fila.id };
  } catch (fallo) {
    console.error('[notiq] no se ha podido crear la nota', fallo);
    return { ok: false, error: 'No se ha podido crear la nota.' };
  }
}

export type NotaCompleta = {
  id: string;
  titulo: string;
  content: unknown;
  favorita: boolean;
  resumen_ia: string | null;
  deleted_at: string | null;
  etiquetas: string[];
  compartir_publico: boolean;
  /** Solo si hay algo que recuperar — el contenido en sí no se manda al
   * cliente hasta que se pide restaurarlo (ver restaurarVersionAnterior). */
  tieneVersionAnterior: boolean;
};

export type TareaDeNota = { id: string; titulo: string; estado: string };

/** Una nota entera más las tareas que salieron de ella, para el editor inline del panel. */
export async function obtenerNota(
  id: string,
): Promise<{ nota: NotaCompleta; tareas: TareaDeNota[] } | null> {
  const sesion = await getSesion();
  if (!sesion) return null;
  if (!esUuid(id)) return null;

  const sql = db();
  const [[nota], etiquetas, tareas] = await Promise.all([
    sql<(Omit<NotaCompleta, 'etiquetas' | 'tieneVersionAnterior'> & { tiene_version_anterior: boolean })[]>`
      select id, titulo, content, favorita, resumen_ia, deleted_at, compartir_publico,
        content_anterior is not null as tiene_version_anterior
      from notes where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
    `,
    etiquetasDeNota(id, sesion.userId),
    sql<TareaDeNota[]>`
      select id, titulo, estado from tasks
      where note_id = ${id}::uuid and user_id = ${sesion.userId}::uuid
      order by created_at desc limit 10
    `,
  ]);
  if (!nota || nota.deleted_at) return null;
  await registrarDepuracion('obtenerNota:leido', { id, content: nota.content });

  // Foto de seguridad del contenido con el que se abre la nota — no del que se
  // guarda al escribir (eso ya lo hace guardarNota constantemente y sería
  // sobrescribirla sin parar). Con await a propósito: en una función
  // serverless una escritura sin esperar no tiene garantía de terminar antes
  // de que acabe la petición, y el sentido entero de esto es que no se pierda.
  await sql`
    update notes set content_anterior = content
    where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
  `;

  const { tiene_version_anterior, ...resto } = nota;
  return {
    nota: { ...resto, etiquetas: etiquetas.map((e) => e.nombre), tieneVersionAnterior: tiene_version_anterior },
    tareas,
  };
}

/** Sustituye las etiquetas de una nota por la lista de nombres dada. */
export async function guardarEtiquetas(id: string, nombres: string[]): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(id)) return { ok: false, error: 'Nota no válida.' };

  try {
    await ponerEtiquetas(id, sesion.userId, nombres);
  } catch (fallo) {
    console.error('[notiq] no se han podido guardar las etiquetas', fallo);
    return { ok: false, error: 'No se han podido guardar las etiquetas.' };
  }

  revalidatePath('/notas');
  return { ok: true };
}

/** Igual que `borrarNota`, pero sin redirigir: el panel ya está donde tiene que estar. */
export async function borrarNotaEnPanel(id: string): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(id)) return { ok: false, error: 'Nota no válida.' };

  const sql = db();
  await sql`
    update notes set deleted_at = now()
    where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
  `;

  revalidatePath('/notas');
  return { ok: true };
}

/** Autoguardado del editor. Se llama desde el cliente con debounce. */
export async function guardarNota(
  id: string,
  titulo: string,
  bloques: Bloque[],
  // TEMPORAL, solo para depuración — de qué punto del cliente viene esta llamada.
  origen = 'sin-marcar',
): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada. Vuelve a entrar.' };
  if (!esUuid(id)) return { ok: false, error: 'Nota no válida.' };

  // comoBloques() aquí no es paranoia decorativa: esto viene del cliente y acaba
  // en jsonb, así que se normaliza antes de escribir.
  const limpios = comoBloques(bloques);
  const sql = db();

  await registrarDepuracion('guardarNota:escribiendo', {
    id,
    origen,
    titulo,
    bloquesRecibidos: bloques,
    bloquesLimpios: limpios,
  });

  try {
    await sql`
      update notes
      set titulo = ${titulo.slice(0, 200)}, content = ${JSON.stringify(limpios)}::jsonb, texto = ${aTextoPlano(limpios)}
      where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
    `;
  } catch (fallo) {
    console.error('[notiq] no se ha podido guardar la nota', fallo);
    return { ok: false, error: 'No se ha podido guardar.' };
  }

  revalidatePath('/notas');
  return { ok: true };
}

/** Recupera la "foto" del contenido tomada al abrir la nota (ver
 * obtenerNota) — un solo paso atrás, no un historial completo. */
export async function restaurarVersionAnterior(
  id: string,
): Promise<(Resultado & { bloques?: Bloque[] }) | { ok: false; error: string }> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(id)) return { ok: false, error: 'Nota no válida.' };

  const sql = db();
  let bloques: Bloque[];
  try {
    const [fila] = await sql<{ content_anterior: unknown }[]>`
      select content_anterior from notes
      where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
    `;
    if (!fila || fila.content_anterior == null) {
      return { ok: false, error: 'No hay ninguna versión anterior guardada de esta nota.' };
    }

    bloques = comoBloques(fila.content_anterior);
    await sql`
      update notes
      set content = ${JSON.stringify(bloques)}::jsonb, texto = ${aTextoPlano(bloques)}, content_anterior = null
      where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
    `;
  } catch (fallo) {
    console.error('[notiq] no se ha podido restaurar la versión anterior', fallo);
    return { ok: false, error: 'No se ha podido restaurar.' };
  }

  revalidatePath('/notas');
  return { ok: true, bloques };
}

export async function alternarFavorita(id: string, favorita: boolean): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(id)) return { ok: false, error: 'Nota no válida.' };

  const sql = db();
  try {
    await sql`
      update notes set favorita = ${favorita}
      where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
    `;
  } catch (fallo) {
    console.error('[notiq] no se ha podido actualizar la nota', fallo);
    return { ok: false, error: 'No se ha podido actualizar.' };
  }

  revalidatePath('/notas');
  return { ok: true };
}

/**
 * Borrado suave: la nota desaparece de la lista pero se puede recuperar, y las
 * tareas que salieron de ella conservan su enlace.
 */
export async function borrarNota(formData: FormData) {
  const sesion = await getSesion();
  if (!sesion) redirect('/entrar');

  const id = String(formData.get('id') ?? '');
  if (!esUuid(id)) redirect('/notas');

  const sql = db();
  await sql`
    update notes set deleted_at = now()
    where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
  `;

  revalidatePath('/notas');
  redirect('/notas');
}

/**
 * Activa o desactiva el enlace público de solo lectura de una nota
 * (app/compartido/[id]/page.tsx). Requiere notes.compartir_publico — ver
 * migrations/0003_notas_compartidas.sql.
 */
export async function alternarCompartir(id: string, compartir: boolean): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(id)) return { ok: false, error: 'Nota no válida.' };

  const sql = db();
  try {
    await sql`
      update notes set compartir_publico = ${compartir}
      where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
    `;
  } catch (fallo) {
    console.error('[notiq] no se ha podido cambiar si la nota se comparte', fallo);
    return { ok: false, error: 'No se ha podido actualizar.' };
  }

  revalidatePath('/notas');
  return { ok: true };
}

export type NotaBorrada = { id: string; titulo: string; deleted_at: string };

/** Notas borradas (borrado suave) del usuario, para la papelera. */
export async function obtenerPapelera(): Promise<NotaBorrada[] | null> {
  const sesion = await getSesion();
  if (!sesion) return null;

  const sql = db();
  return sql<NotaBorrada[]>`
    select id, titulo, deleted_at from notes
    where user_id = ${sesion.userId}::uuid and deleted_at is not null
    order by deleted_at desc limit 100
  `;
}

export async function restaurarNota(id: string): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(id)) return { ok: false, error: 'Nota no válida.' };

  const sql = db();
  await sql`
    update notes set deleted_at = null
    where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
  `;

  revalidatePath('/notas');
  return { ok: true };
}

/**
 * Borrado definitivo, sin vuelta atrás — a diferencia de borrarNota(EnPanel), que
 * solo pone deleted_at. El `and deleted_at is not null` es cinturón y tirantes: una
 * nota tiene que haber pasado por la papelera antes de poder borrarse para siempre.
 */
export async function eliminarNotaParaSiempre(id: string): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(id)) return { ok: false, error: 'Nota no válida.' };

  const sql = db();
  await sql`
    delete from notes
    where id = ${id}::uuid and user_id = ${sesion.userId}::uuid and deleted_at is not null
  `;

  revalidatePath('/notas');
  return { ok: true };
}

/**
 * Convierte esta nota en una tarea con fecha de vencimiento, para tenerla en el
 * tablero de Tareas. No es una notificación push — Notiq todavía no manda
 * ninguna (el cron que las dispararía es trabajo futuro, ver ROADMAP.md) — así
 * que esto es honesto sobre lo que hace: aparecer, con fecha, en Tareas.
 */
export async function crearRecordatorioDeNota(noteId: string, vence: string): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(noteId)) return { ok: false, error: 'Nota no válida.' };

  const venceValida = fechaValidaONull(vence);
  if (!venceValida) return { ok: false, error: 'Fecha no válida.' };

  const sql = db();
  const [nota] = await sql<{ titulo: string }[]>`
    select titulo from notes
    where id = ${noteId}::uuid and user_id = ${sesion.userId}::uuid and deleted_at is null
  `;
  if (!nota) return { ok: false, error: 'Esa nota ya no está disponible.' };

  try {
    await sql`
      insert into tasks (user_id, note_id, titulo, vence, origen)
      values (
        ${sesion.userId}::uuid, ${noteId}::uuid,
        ${(nota.titulo || 'Recordatorio').slice(0, 200)}, ${venceValida}, 'manual'
      )
    `;
  } catch (fallo) {
    console.error('[notiq] no se ha podido crear el recordatorio', fallo);
    return { ok: false, error: 'No se ha podido crear el recordatorio.' };
  }

  revalidatePath('/tareas');
  return { ok: true };
}

export type NotaRelacionada = { id: string; titulo: string };

/**
 * Notas que mencionan esta ("[[Título de esta nota]]" en su texto) — el enlace se
 * escribe a mano (ver vincularNota en NotaEditor.tsx) y esto es lo que lo
 * convierte en un backlink: en vez de guardar la relación en una tabla aparte
 * (una migración más, y una que se puede desincronizar del título si la nota
 * enlazada se renombra), se busca en caliente contra `notes.texto`. Con el
 * volumen de una cuenta personal no hace falta más.
 *
 * `position(... in ...)` y no `ilike '%...%'`: así un título con `%` o `_` de
 * verdad no se interpreta como comodín de patrón, se busca tal cual.
 */
export async function obtenerNotasRelacionadas(id: string): Promise<NotaRelacionada[] | null> {
  const sesion = await getSesion();
  if (!sesion) return null;
  if (!esUuid(id)) return null;

  const sql = db();
  const [actual] = await sql<{ titulo: string }[]>`
    select titulo from notes where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
  `;
  if (!actual || !actual.titulo.trim()) return [];

  const marcador = `[[${actual.titulo}]]`;
  return sql<NotaRelacionada[]>`
    select id, titulo from notes
    where user_id = ${sesion.userId}::uuid and deleted_at is null and id != ${id}::uuid
      and position(lower(${marcador}) in lower(texto)) > 0
    order by updated_at desc
    limit 20
  `;
}

/**
 * Duplica una nota entera: título (con "(copia)"), bloques y etiquetas. No
 * duplica los adjuntos (imágenes/PDF): seguirían apuntando al mismo archivo en
 * la base de datos, que se borraría si se borra la nota original — duplicar el
 * archivo de verdad es trabajo aparte que no entra en un "duplicar" rápido.
 */
export async function duplicarNota(id: string): Promise<Resultado & { id?: string }> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(id)) return { ok: false, error: 'Nota no válida.' };

  const cupo = await puedeCrearNota(sesion.userId, sesion.plan);
  if (!cupo.permitido) {
    return { ok: false, error: `Límite de ${cupo.limite} notas del plan alcanzado.` };
  }

  const sql = db();
  const [original] = await sql<
    { titulo: string; content: unknown; texto: string; folder_id: string | null }[]
  >`
    select titulo, content, texto, folder_id from notes
    where id = ${id}::uuid and user_id = ${sesion.userId}::uuid and deleted_at is null
  `;
  if (!original) return { ok: false, error: 'Esa nota ya no está disponible.' };

  try {
    const [copia] = await sql.begin(async (tx) => {
      const [fila] = await tx<{ id: string }[]>`
        insert into notes (user_id, titulo, content, texto, folder_id)
        values (
          ${sesion.userId}::uuid,
          ${`${original.titulo || 'Sin título'} (copia)`.slice(0, 200)},
          ${JSON.stringify(original.content)}::jsonb,
          ${original.texto},
          ${original.folder_id}::uuid
        )
        returning id
      `;
      await tx`
        insert into note_tags (note_id, tag_id)
        select ${fila.id}::uuid, tag_id from note_tags where note_id = ${id}::uuid
      `;
      return [fila];
    });

    revalidatePath('/notas');
    return { ok: true, id: copia.id };
  } catch (fallo) {
    console.error('[notiq] no se ha podido duplicar la nota', fallo);
    return { ok: false, error: 'No se ha podido duplicar la nota.' };
  }
}

export async function crearCarpeta(formData: FormData) {
  const sesion = await getSesion();
  if (!sesion) redirect('/entrar');

  const nombre = String(formData.get('nombre') ?? '').trim();
  if (!nombre) redirect('/notas');

  const sql = db();
  await sql`
    insert into folders (user_id, nombre) values (${sesion.userId}::uuid, ${nombre.slice(0, 80)})
  `;

  revalidatePath('/notas');
}

/**
 * Borra una carpeta. Las notas, tareas, flashcards y exámenes que tuviera
 * dentro NO se borran — todas sus columnas folder_id son `on delete set
 * null` (ver migrations/0001, 0002 y 0004), así que solo se quedan sin
 * carpeta. Se revalida en todas las pestañas que enseñan carpetas: Notas las
 * crea, pero Tareas, Inicio y Estudio también las leen.
 */
export async function borrarCarpeta(id: string): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };

  const folderIdPropia = await verificarCarpetaPropia(sesion.userId, id);
  if (!folderIdPropia) return { ok: false, error: 'Carpeta no válida.' };

  const sql = db();
  try {
    await sql`delete from folders where id = ${folderIdPropia}::uuid`;
  } catch (fallo) {
    console.error('[notiq] no se ha podido borrar la carpeta', fallo);
    return { ok: false, error: 'No se ha podido borrar la carpeta.' };
  }

  revalidatePath('/notas');
  revalidatePath('/tareas');
  revalidatePath('/inicio');
  revalidatePath('/estudio');
  return { ok: true };
}

/** Guarda el resumen que ha devuelto la IA para no volver a pagarlo al recargar. */
export async function guardarResumen(id: string, resumen: string): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(id)) return { ok: false, error: 'Nota no válida.' };

  const sql = db();
  try {
    await sql`
      update notes set resumen_ia = ${resumen}, resumen_ia_el = now()
      where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
    `;
  } catch (fallo) {
    console.error('[notiq] no se ha podido guardar el resumen', fallo);
    return { ok: false, error: 'No se ha podido guardar el resumen.' };
  }

  revalidatePath(`/notas/${id}`);
  return { ok: true };
}

/** Inserta en el tablero las tareas que la IA ha sacado de una nota. */
export async function guardarTareasExtraidas(
  noteId: string,
  tareas: { titulo: string; prioridad: string; vence: string | null }[],
): Promise<Resultado & { creadas?: number }> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(noteId)) return { ok: false, error: 'Esa nota ya no está disponible.' };

  const sql = db();

  // El panel de IA manda el noteId que ya tenía cargado en el cliente; se
  // reconfirma aquí que esa nota es del usuario antes de enlazar tareas a ella —
  // sin RLS, nada más lo garantiza.
  const [notaPropia] = await sql<{ id: string }[]>`
    select id from notes where id = ${noteId}::uuid and user_id = ${sesion.userId}::uuid
  `;
  if (!notaPropia) return { ok: false, error: 'Esa nota ya no está disponible.' };

  const prioridadesValidas = ['urgente', 'alta', 'normal', 'baja'];

  const filas = tareas
    .map((t) => ({
      titulo: String(t.titulo ?? '').trim().slice(0, 200),
      prioridad: prioridadesValidas.includes(t.prioridad) ? t.prioridad : 'normal',
      vence: fechaValidaONull(t.vence),
    }))
    .filter((t) => t.titulo.length > 0);

  if (filas.length === 0) return { ok: true, creadas: 0 };

  try {
    // Una transacción y no un insert por fila: si una tarea fallara a mitad
    // (aunque las fechas ya se validan arriba, más vale no depender solo de
    // eso), un bucle sin transacción dejaría las anteriores ya guardadas
    // mientras se informa de un fallo total — y un reintento las duplicaría.
    await sql.begin((tx) =>
      Promise.all(
        filas.map(
          (fila) => tx`
            insert into tasks (user_id, note_id, titulo, prioridad, vence, origen)
            values (${sesion.userId}::uuid, ${noteId}::uuid, ${fila.titulo}, ${fila.prioridad}, ${fila.vence}, 'ia')
          `,
        ),
      ),
    );
  } catch (fallo) {
    console.error('[notiq] no se han podido guardar las tareas extraídas', fallo);
    return { ok: false, error: 'No se han podido guardar las tareas.' };
  }

  revalidatePath('/tareas');
  return { ok: true, creadas: filas.length };
}

/** Límite de notas del plan, para avisar antes de que el usuario se choque con él. */
export async function estadoCupoNotas() {
  const sesion = await getSesion();
  if (!sesion) return null;

  const cupo = await puedeCrearNota(sesion.userId, sesion.plan);
  return { ...cupo, plan: sesion.plan, limites: limitesDe(sesion.plan) };
}

export type NotaResumen = {
  id: string;
  titulo: string;
  content: unknown;
  favorita: boolean;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
  etiquetas: string[];
};

/**
 * La misma búsqueda/listado que antes vivía en `notas/page.tsx`, pero como acción
 * llamable desde el cliente: el panel único carga y filtra sin navegar, así que ya
 * no hay searchParams de los que leer `carpeta` y `q`.
 *
 * `carpeta` y `etiqueta` son excluyentes entre sí (como ya lo eran `carpeta` y `q`):
 * un segundo filtro a la vez complicaría la consulta sin que el panel lo pida —
 * elegir una etiqueta limpia la carpeta elegida, y viceversa.
 */
export async function obtenerNotas(filtro: { carpeta?: string; etiqueta?: string; q?: string }) {
  const sesion = await getSesion();
  if (!sesion) return null;

  const sql = db();
  const { userId, plan } = sesion;
  const { carpeta, etiqueta, q } = filtro;

  const [carpetas, etiquetas, [{ total: totalNotas }]] = await Promise.all([
    sql<{ id: string; nombre: string }[]>`
      select id, nombre from folders where user_id = ${userId}::uuid order by nombre
    `,
    sql<{ id: string; nombre: string }[]>`
      select id, nombre from tags where user_id = ${userId}::uuid order by nombre
    `,
    sql<{ total: number }[]>`
      select count(*)::int as total from notes where user_id = ${userId}::uuid and deleted_at is null
    `,
  ]);

  let notas: NotaResumen[] = [];

  if (q) {
    const relevantes = await sql<{ id: string }[]>`
      select id from buscar_notas(${userId}::uuid, ${q}, 50)
    `;
    const ids = relevantes.map((f) => f.id);

    if (ids.length > 0) {
      const completas = await sql<NotaResumen[]>`
        select n.id, n.titulo, n.content, n.favorita, n.folder_id, n.created_at, n.updated_at,
          coalesce((
            select array_agg(t.nombre order by t.nombre)
            from note_tags nt join tags t on t.id = nt.tag_id
            where nt.note_id = n.id
          ), '{}') as etiquetas
        from notes n where n.id = any(${ids}::uuid[]) and n.user_id = ${userId}::uuid
      `;
      const porId = new Map(completas.map((n) => [n.id, n]));
      notas = ids.flatMap((id) => {
        const nota = porId.get(id);
        return nota ? [nota] : [];
      });
    }
  } else if (etiqueta && esUuid(etiqueta)) {
    notas = await sql<NotaResumen[]>`
      select n.id, n.titulo, n.content, n.favorita, n.folder_id, n.created_at, n.updated_at,
        coalesce((
          select array_agg(t.nombre order by t.nombre)
          from note_tags nt join tags t on t.id = nt.tag_id
          where nt.note_id = n.id
        ), '{}') as etiquetas
      from notes n
      where n.user_id = ${userId}::uuid and n.deleted_at is null
        and exists (select 1 from note_tags nt where nt.note_id = n.id and nt.tag_id = ${etiqueta}::uuid)
      order by n.favorita desc, n.updated_at desc limit 100
    `;
  } else if (carpeta && esUuid(carpeta)) {
    notas = await sql<NotaResumen[]>`
      select n.id, n.titulo, n.content, n.favorita, n.folder_id, n.created_at, n.updated_at,
        coalesce((
          select array_agg(t.nombre order by t.nombre)
          from note_tags nt join tags t on t.id = nt.tag_id
          where nt.note_id = n.id
        ), '{}') as etiquetas
      from notes n
      where n.user_id = ${userId}::uuid and n.deleted_at is null and n.folder_id = ${carpeta}::uuid
      order by n.favorita desc, n.updated_at desc limit 100
    `;
  } else {
    notas = await sql<NotaResumen[]>`
      select n.id, n.titulo, n.content, n.favorita, n.folder_id, n.created_at, n.updated_at,
        coalesce((
          select array_agg(t.nombre order by t.nombre)
          from note_tags nt join tags t on t.id = nt.tag_id
          where nt.note_id = n.id
        ), '{}') as etiquetas
      from notes n
      where n.user_id = ${userId}::uuid and n.deleted_at is null
      order by n.favorita desc, n.updated_at desc limit 100
    `;
  }

  return { carpetas, etiquetas, totalNotas, notas, plan };
}
