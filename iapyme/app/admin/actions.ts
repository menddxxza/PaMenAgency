'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type ResultadoModeracion = { ok: true } | { ok: false; error: string };

/**
 * Comprueba que quien llama es administrador. Los triggers de la base de datos ya
 * bloquean publicar sin serlo, pero conviene fallar aquí con un mensaje claro en vez
 * de dejar que reviente abajo.
 */
async function exigirAdmin() {
  const supabase = createClient();
  if (!supabase) return { supabase: null, error: 'La base de datos no está configurada.' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: 'Tienes que iniciar sesión.' };

  const { data: perfil } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (perfil?.role !== 'admin') {
    return { supabase: null, error: 'Solo un administrador puede moderar fichas.' };
  }

  return { supabase, error: null };
}

export async function aprobarFicha(id: string): Promise<ResultadoModeracion> {
  const { supabase, error: errorAuth } = await exigirAdmin();
  if (!supabase) return { ok: false, error: errorAuth! };

  const { error } = await supabase
    .from('products')
    .update({ status: 'published', motivo_rechazo: null })
    .eq('id', id);

  if (error) return { ok: false, error: 'No hemos podido publicarla.' };

  revalidatePath('/admin');
  revalidatePath('/');
  return { ok: true };
}

export async function rechazarFicha(
  id: string,
  motivo: string,
): Promise<ResultadoModeracion> {
  const limpio = motivo.trim().slice(0, 1000);
  if (limpio.length < 10) {
    return {
      ok: false,
      error: 'Explica el motivo: el vendedor necesita saber qué corregir.',
    };
  }

  const { supabase, error: errorAuth } = await exigirAdmin();
  if (!supabase) return { ok: false, error: errorAuth! };

  const { error } = await supabase
    .from('products')
    .update({ status: 'rejected', motivo_rechazo: limpio })
    .eq('id', id);

  if (error) return { ok: false, error: 'No hemos podido rechazarla.' };

  revalidatePath('/admin');
  return { ok: true };
}

export async function destacarFicha(
  id: string,
  destacar: boolean,
): Promise<ResultadoModeracion> {
  const { supabase, error: errorAuth } = await exigirAdmin();
  if (!supabase) return { ok: false, error: errorAuth! };

  const { error } = await supabase
    .from('products')
    .update({ is_featured: destacar })
    .eq('id', id);

  if (error) return { ok: false, error: 'No hemos podido cambiarlo.' };

  revalidatePath('/admin');
  revalidatePath('/');
  return { ok: true };
}
