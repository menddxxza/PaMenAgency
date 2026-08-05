'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSesion } from '@/lib/sesion';
import { db, esUuid } from '@/lib/db';
import { puedeCrearNota } from '@/lib/ia/limites';
import { aTextoPlano, comoBloques, type Bloque } from '@/lib/bloques';
import { limitesDe } from '@/lib/planes';

export type Resultado = { ok: true } | { ok: false; error: string };

/**
 * Confirma que una carpeta es del usuario antes de usarla, y si no lo es, la
 * descarta en vez de fallar. El formulario que manda `folder_id` es el propio de
 * Notiq, pero es un campo oculto de un <form> normal: cualquiera puede mandar un id
 * ajeno a mano. Sin RLS, nada más lo impide — hay que comprobarlo aquí.
 */
async function verificarCarpetaPropia(userId: string, folderId: string): Promise<string | null> {
  if (!esUuid(folderId)) return null;

  const sql = db();
  const filas = await sql<{ id: string }[]>`
    select id from folders where id = ${folderId}::uuid and user_id = ${userId}::uuid
  `;
  return filas[0]?.id ?? null;
}

/** Crea una nota vacía y lleva a su editor. */
export async function crearNota(formData: FormData) {
  const sesion = await getSesion();
  if (!sesion) redirect('/entrar');

  const cupo = await puedeCrearNota(sesion.userId, sesion.plan);
  if (!cupo.permitido) {
    redirect(`/notas?limite=${cupo.limite}`);
  }

  const folderId = formData.get('folder_id');
  const folderIdPropia =
    typeof folderId === 'string' && folderId ? await verificarCarpetaPropia(sesion.userId, folderId) : null;

  const sql = db();
  let nuevaId: string;
  try {
    const [fila] = await sql<{ id: string }[]>`
      insert into notes (user_id, titulo, content, texto, folder_id)
      values (${sesion.userId}::uuid, '', '[]'::jsonb, '', ${folderIdPropia}::uuid)
      returning id
    `;
    nuevaId = fila.id;
  } catch (fallo) {
    console.error('[notiq] no se ha podido crear la nota', fallo);
    redirect('/notas?error=crear');
  }

  revalidatePath('/notas');
  redirect(`/notas/${nuevaId}`);
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
      vence: /^\d{4}-\d{2}-\d{2}$/.test(t.vence ?? '') ? t.vence : null,
    }))
    .filter((t) => t.titulo.length > 0);

  if (filas.length === 0) return { ok: true, creadas: 0 };

  try {
    for (const fila of filas) {
      await sql`
        insert into tasks (user_id, note_id, titulo, prioridad, vence, origen)
        values (${sesion.userId}::uuid, ${noteId}::uuid, ${fila.titulo}, ${fila.prioridad}, ${fila.vence}, 'ia')
      `;
    }
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
