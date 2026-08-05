'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSesion, type Sesion } from '@/lib/supabase/server';
import { puedeCrearNota } from '@/lib/ia/limites';
import { aTextoPlano, comoBloques, type Bloque } from '@/lib/bloques';
import { limitesDe } from '@/lib/planes';

export type Resultado = { ok: true } | { ok: false; error: string };

/**
 * Confirma que una carpeta es del usuario antes de usarla, y si no lo es, la
 * descarta en vez de fallar. El formulario que manda `folder_id` es el propio de
 * Notiq, pero es un campo oculto de un <form> normal: cualquiera puede mandar un id
 * ajeno a mano. RLS ya impide leer carpetas de otros, pero no evita que un insert en
 * `notes` apunte su `folder_id` a una carpeta que no es tuya — la FK solo exige que
 * la fila exista, no que sea tuya.
 */
async function verificarCarpetaPropia(sesion: Sesion, folderId: string): Promise<string | null> {
  const { data } = await sesion.supabase
    .from('folders')
    .select('id')
    .eq('id', folderId)
    .eq('user_id', sesion.userId)
    .maybeSingle();

  return data?.id ?? null;
}

/** Crea una nota vacía y lleva a su editor. */
export async function crearNota(formData: FormData) {
  const sesion = await getSesion();
  if (!sesion) redirect('/entrar');

  const cupo = await puedeCrearNota(sesion.supabase, sesion.userId, sesion.plan);
  if (!cupo.permitido) {
    redirect(`/notas?limite=${cupo.limite}`);
  }

  const folderId = formData.get('folder_id');
  const folderIdPropia =
    typeof folderId === 'string' && folderId ? await verificarCarpetaPropia(sesion, folderId) : null;

  const { data, error } = await sesion.supabase
    .from('notes')
    .insert({
      user_id: sesion.userId,
      titulo: '',
      content: [],
      texto: '',
      folder_id: folderIdPropia,
    })
    .select('id')
    .single();

  if (error || !data) redirect('/notas?error=crear');

  revalidatePath('/notas');
  redirect(`/notas/${data.id}`);
}

/** Autoguardado del editor. Se llama desde el cliente con debounce. */
export async function guardarNota(
  id: string,
  titulo: string,
  bloques: Bloque[],
): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada. Vuelve a entrar.' };

  // comoBloques() aquí no es paranoia decorativa: esto viene del cliente y acaba
  // en jsonb, así que se normaliza antes de escribir.
  const limpios = comoBloques(bloques);

  const { error } = await sesion.supabase
    .from('notes')
    .update({
      titulo: titulo.slice(0, 200),
      content: limpios,
      texto: aTextoPlano(limpios),
    })
    .eq('id', id)
    .eq('user_id', sesion.userId);

  if (error) return { ok: false, error: 'No se ha podido guardar.' };

  revalidatePath('/notas');
  return { ok: true };
}

export async function alternarFavorita(id: string, favorita: boolean): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };

  const { error } = await sesion.supabase
    .from('notes')
    .update({ favorita })
    .eq('id', id)
    .eq('user_id', sesion.userId);

  if (error) return { ok: false, error: 'No se ha podido actualizar.' };

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
  if (!id) redirect('/notas');

  await sesion.supabase
    .from('notes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', sesion.userId);

  revalidatePath('/notas');
  redirect('/notas');
}

export async function crearCarpeta(formData: FormData) {
  const sesion = await getSesion();
  if (!sesion) redirect('/entrar');

  const nombre = String(formData.get('nombre') ?? '').trim();
  if (!nombre) redirect('/notas');

  await sesion.supabase.from('folders').insert({
    user_id: sesion.userId,
    nombre: nombre.slice(0, 80),
  });

  revalidatePath('/notas');
}

/** Guarda el resumen que ha devuelto la IA para no volver a pagarlo al recargar. */
export async function guardarResumen(id: string, resumen: string): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };

  const { error } = await sesion.supabase
    .from('notes')
    .update({ resumen_ia: resumen, resumen_ia_el: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', sesion.userId);

  if (error) return { ok: false, error: 'No se ha podido guardar el resumen.' };

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

  // El panel de IA manda el noteId que ya tenía cargado en el cliente; se
  // reconfirma aquí que esa nota es del usuario antes de enlazar tareas a ella,
  // por la misma razón que en verificarCarpetaPropia: un note_id ajeno no rompe
  // RLS (nadie más ve estas tareas), pero deja una referencia incoherente.
  const { data: notaPropia } = await sesion.supabase
    .from('notes')
    .select('id')
    .eq('id', noteId)
    .eq('user_id', sesion.userId)
    .maybeSingle();

  if (!notaPropia) return { ok: false, error: 'Esa nota ya no está disponible.' };

  const prioridadesValidas = ['urgente', 'alta', 'normal', 'baja'];

  const filas = tareas
    .map((t) => ({
      user_id: sesion.userId,
      note_id: noteId,
      titulo: String(t.titulo ?? '').trim().slice(0, 200),
      prioridad: prioridadesValidas.includes(t.prioridad) ? t.prioridad : 'normal',
      vence: /^\d{4}-\d{2}-\d{2}$/.test(t.vence ?? '') ? t.vence : null,
      origen: 'ia' as const,
    }))
    .filter((t) => t.titulo.length > 0);

  if (filas.length === 0) return { ok: true, creadas: 0 };

  const { error } = await sesion.supabase.from('tasks').insert(filas);
  if (error) return { ok: false, error: 'No se han podido guardar las tareas.' };

  revalidatePath('/tareas');
  return { ok: true, creadas: filas.length };
}

/** Límite de notas del plan, para avisar antes de que el usuario se choque con él. */
export async function estadoCupoNotas() {
  const sesion = await getSesion();
  if (!sesion) return null;

  const cupo = await puedeCrearNota(sesion.supabase, sesion.userId, sesion.plan);
  return { ...cupo, plan: sesion.plan, limites: limitesDe(sesion.plan) };
}
