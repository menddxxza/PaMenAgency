import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigurado } from './config';

/**
 * Cliente para Server Components y Route Handlers.
 * Devuelve null si aún no hay proyecto de Supabase configurado, para que las páginas
 * puedan mostrar un aviso en lugar de romperse.
 */
export function createClient(): SupabaseClient | null {
  if (!supabaseConfigurado()) return null;

  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Los Server Components no pueden escribir cookies. El middleware ya se
          // encarga de refrescar la sesión, así que aquí se puede ignorar.
        }
      },
    },
  });
}

/** El perfil del usuario que ha iniciado sesión, o null. */
export async function getPerfilActual() {
  const supabase = createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data ? { ...data, email: user.email } : null;
}
