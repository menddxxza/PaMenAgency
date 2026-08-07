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

export type Resultado = { ok: true } | { ok: false; error: string };

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
  const [nota] = await sql<NotaCompleta[]>`
    select id, titulo, content, favorita, resumen_ia, deleted_at
    from notes where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
  `;
  if (!nota || nota.deleted_at) return null;

  const tareas = await sql<TareaDeNota[]>`
    select id, titulo, estado from tasks
    where note_id = ${id}::uuid and user_id = ${sesion.userId}::uuid
    order by created_at desc limit 10
  `;

  return { nota, tareas };
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
export async function guardarNota(id: string, titulo: string, bloques: Bloque[]): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada. Vuelve a entrar.' };
  if (!esUuid(id)) return { ok: false, error: 'Nota no válida.' };

  // comoBloques() aquí no es paranoia decorativa: esto viene del cliente y acaba
  // en jsonb, así que se normaliza antes de escribir.
  const limpios = comoBloques(bloques);
  const sql = db();

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
  updated_at: string;
};

/**
 * La misma búsqueda/listado que antes vivía en `notas/page.tsx`, pero como acción
 * llamable desde el cliente: el panel único carga y filtra sin navegar, así que ya
 * no hay searchParams de los que leer `carpeta` y `q`.
 */
export async function obtenerNotas(filtro: { carpeta?: string; q?: string }) {
  const sesion = await getSesion();
  if (!sesion) return null;

  const sql = db();
  const { userId, plan } = sesion;
  const { carpeta, q } = filtro;

  const [carpetas, [{ total: totalNotas }]] = await Promise.all([
    sql<{ id: string; nombre: string }[]>`
      select id, nombre from folders where user_id = ${userId}::uuid order by nombre
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
        select id, titulo, content, favorita, folder_id, updated_at
        from notes where id = any(${ids}::uuid[]) and user_id = ${userId}::uuid
      `;
      const porId = new Map(completas.map((n) => [n.id, n]));
      notas = ids.flatMap((id) => {
        const nota = porId.get(id);
        return nota ? [nota] : [];
      });
    }
  } else if (carpeta && esUuid(carpeta)) {
    notas = await sql<NotaResumen[]>`
      select id, titulo, content, favorita, folder_id, updated_at from notes
      where user_id = ${userId}::uuid and deleted_at is null and folder_id = ${carpeta}::uuid
      order by favorita desc, updated_at desc limit 100
    `;
  } else {
    notas = await sql<NotaResumen[]>`
      select id, titulo, content, favorita, folder_id, updated_at from notes
      where user_id = ${userId}::uuid and deleted_at is null
      order by favorita desc, updated_at desc limit 100
    `;
  }

  return { carpetas, totalNotas, notas, plan };
}
