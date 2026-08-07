'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSesion } from '@/lib/sesion';
import { db, esUuid } from '@/lib/db';
import { fechaValidaONull, type Tarea } from '@/lib/tareas';

export type Resultado = { ok: true } | { ok: false; error: string };

const ESTADOS = ['pendiente', 'en_curso', 'hecha'] as const;
const PRIORIDADES = ['urgente', 'alta', 'normal', 'baja'] as const;

export type Estado = (typeof ESTADOS)[number];
export type Prioridad = (typeof PRIORIDADES)[number];

export async function crearTarea(formData: FormData) {
  const sesion = await getSesion();
  if (!sesion) redirect('/entrar');

  const titulo = String(formData.get('titulo') ?? '').trim();
  if (!titulo) return;

  const prioridadCruda = String(formData.get('prioridad') ?? 'normal');
  const vence = String(formData.get('vence') ?? '');
  const prioridad = (PRIORIDADES as readonly string[]).includes(prioridadCruda)
    ? prioridadCruda
    : 'normal';
  const venceValida = fechaValidaONull(vence);

  const sql = db();
  await sql`
    insert into tasks (user_id, titulo, prioridad, vence)
    values (${sesion.userId}::uuid, ${titulo.slice(0, 200)}, ${prioridad}, ${venceValida})
  `;

  revalidatePath('/tareas');
}

export async function cambiarEstado(id: string, estado: Estado): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(id)) return { ok: false, error: 'Tarea no válida.' };

  if (!(ESTADOS as readonly string[]).includes(estado)) {
    return { ok: false, error: 'Estado no válido.' };
  }

  const sql = db();
  try {
    // Se registra cuándo se completó, para poder medir después qué se cierra y
    // qué se arrastra semana tras semana.
    await sql`
      update tasks
      set estado = ${estado}, completada_el = ${estado === 'hecha' ? sql`now()` : null}
      where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
    `;
  } catch (fallo) {
    console.error('[notiq] no se ha podido actualizar el estado de la tarea', fallo);
    return { ok: false, error: 'No se ha podido actualizar la tarea.' };
  }

  revalidatePath('/tareas');
  return { ok: true };
}

export async function cambiarPrioridad(id: string, prioridad: Prioridad): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(id)) return { ok: false, error: 'Tarea no válida.' };

  if (!(PRIORIDADES as readonly string[]).includes(prioridad)) {
    return { ok: false, error: 'Prioridad no válida.' };
  }

  const sql = db();
  try {
    await sql`
      update tasks set prioridad = ${prioridad}
      where id = ${id}::uuid and user_id = ${sesion.userId}::uuid
    `;
  } catch (fallo) {
    console.error('[notiq] no se ha podido actualizar la prioridad de la tarea', fallo);
    return { ok: false, error: 'No se ha podido actualizar la tarea.' };
  }

  revalidatePath('/tareas');
  return { ok: true };
}

/** Listado completo, para que el panel único lo cargue por su cuenta al abrir la pestaña. */
export async function obtenerTareas(): Promise<Tarea[] | null> {
  const sesion = await getSesion();
  if (!sesion) return null;

  const sql = db();
  return sql<Tarea[]>`
    select id, titulo, estado, prioridad, vence::text, note_id, origen from tasks
    where user_id = ${sesion.userId}::uuid
    order by created_at desc limit 500
  `;
}

export async function borrarTarea(id: string): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };
  if (!esUuid(id)) return { ok: false, error: 'Tarea no válida.' };

  const sql = db();
  try {
    await sql`delete from tasks where id = ${id}::uuid and user_id = ${sesion.userId}::uuid`;
  } catch (fallo) {
    console.error('[notiq] no se ha podido eliminar la tarea', fallo);
    return { ok: false, error: 'No se ha podido eliminar la tarea.' };
  }

  revalidatePath('/tareas');
  return { ok: true };
}
