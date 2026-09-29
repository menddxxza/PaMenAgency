'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { familiaPorSlug } from '@/lib/tipos-publicacion';
import type { ResultadoAccion } from '@/app/dashboard/actions';

/** Postgres: 42P01 es "la tabla no existe" — falta ejecutar la migración 0006. */
const AVISO_SIN_TABLA =
  'Las alertas todavía no están activadas en este proyecto. Pídele al administrador que ejecute la migración pendiente.';

function limpiar(valor: FormDataEntryValue | null, maximo: number): string {
  return typeof valor === 'string' ? valor.trim().slice(0, maximo) : '';
}

export async function crearAlerta(formData: FormData): Promise<ResultadoAccion> {
  const supabase = createClient();
  if (!supabase) return { ok: false, error: 'La base de datos no está configurada.' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Tienes que iniciar sesión.' };

  const termino = limpiar(formData.get('termino'), 200) || null;
  const provincia = limpiar(formData.get('provincia'), 80) || null;
  const familiaSlug = limpiar(formData.get('familia'), 40);
  const familia = familiaSlug ? familiaPorSlug(familiaSlug) : undefined;

  if (!termino && !provincia && !familia) {
    return { ok: false, error: 'Añade al menos un término, una provincia o un tipo.' };
  }

  const { error } = await supabase.from('alertas_busqueda').insert({
    usuario_id: user.id,
    termino,
    provincia,
    tipos: familia?.tipos ?? [],
  });

  if (error) {
    return {
      ok: false,
      error: error.code === '42P01' ? AVISO_SIN_TABLA : 'No se ha podido guardar la alerta.',
    };
  }

  revalidatePath('/dashboard/alertas');
  return { ok: true };
}

export async function eliminarAlerta(id: string): Promise<ResultadoAccion> {
  const supabase = createClient();
  if (!supabase) return { ok: false, error: 'La base de datos no está configurada.' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Tienes que iniciar sesión.' };

  // Sin `.eq('usuario_id', ...)` la política de RLS ya lo impediría, pero
  // filtrar aquí también evita depender solo de esa capa para algo tan
  // sensible como borrar el dato de otra persona.
  const { error } = await supabase
    .from('alertas_busqueda')
    .delete()
    .eq('id', id)
    .eq('usuario_id', user.id);

  if (error) return { ok: false, error: 'No se ha podido borrar la alerta.' };

  revalidatePath('/dashboard/alertas');
  return { ok: true };
}

export async function alternarAlerta(id: string, activa: boolean): Promise<ResultadoAccion> {
  const supabase = createClient();
  if (!supabase) return { ok: false, error: 'La base de datos no está configurada.' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Tienes que iniciar sesión.' };

  const { error } = await supabase
    .from('alertas_busqueda')
    .update({ activa })
    .eq('id', id)
    .eq('usuario_id', user.id);

  if (error) return { ok: false, error: 'No se ha podido actualizar la alerta.' };

  revalidatePath('/dashboard/alertas');
  return { ok: true };
}
