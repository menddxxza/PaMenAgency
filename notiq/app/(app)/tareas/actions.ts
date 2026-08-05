'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSesion } from '@/lib/supabase/server';

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

  const prioridad = String(formData.get('prioridad') ?? 'normal');
  const vence = String(formData.get('vence') ?? '');

  await sesion.supabase.from('tasks').insert({
    user_id: sesion.userId,
    titulo: titulo.slice(0, 200),
    prioridad: (PRIORIDADES as readonly string[]).includes(prioridad) ? prioridad : 'normal',
    vence: /^\d{4}-\d{2}-\d{2}$/.test(vence) ? vence : null,
  });

  revalidatePath('/tareas');
}

export async function cambiarEstado(id: string, estado: Estado): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };

  if (!(ESTADOS as readonly string[]).includes(estado)) {
    return { ok: false, error: 'Estado no válido.' };
  }

  const { error } = await sesion.supabase
    .from('tasks')
    .update({
      estado,
      // Se registra cuándo se completó, para poder medir después qué se cierra y
      // qué se arrastra semana tras semana.
      completada_el: estado === 'hecha' ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .eq('user_id', sesion.userId);

  if (error) return { ok: false, error: 'No se ha podido actualizar la tarea.' };

  revalidatePath('/tareas');
  return { ok: true };
}

export async function cambiarPrioridad(id: string, prioridad: Prioridad): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };

  if (!(PRIORIDADES as readonly string[]).includes(prioridad)) {
    return { ok: false, error: 'Prioridad no válida.' };
  }

  const { error } = await sesion.supabase
    .from('tasks')
    .update({ prioridad })
    .eq('id', id)
    .eq('user_id', sesion.userId);

  if (error) return { ok: false, error: 'No se ha podido actualizar la tarea.' };

  revalidatePath('/tareas');
  return { ok: true };
}

export async function borrarTarea(id: string): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };

  const { error } = await sesion.supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', sesion.userId);

  if (error) return { ok: false, error: 'No se ha podido eliminar la tarea.' };

  revalidatePath('/tareas');
  return { ok: true };
}
