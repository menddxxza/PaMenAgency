import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigurado } from './config';
import { comoPlan, type Plan } from '@/lib/planes';

/**
 * Cliente para Server Components, Server Actions y Route Handlers.
 * Devuelve null si aún no hay Supabase configurado.
 */
export async function createClient(): Promise<SupabaseClient | null> {
  if (!supabaseConfigurado()) return null;

  const cookieStore = await cookies();

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
          // Los Server Components no pueden escribir cookies. El middleware ya
          // refresca la sesión, así que aquí se puede ignorar.
        }
      },
    },
  });
}

export type Sesion = {
  supabase: SupabaseClient;
  userId: string;
  email: string | null;
  plan: Plan;
};

/**
 * Sesión + plan del usuario actual, o null si no ha iniciado sesión.
 *
 * El plan viaja en `profiles.plan`, que solo escribe el webhook de Stripe con la
 * service role key: el usuario puede leer su fila pero no ascenderse a Pro solo.
 */
export async function getSesion(): Promise<Sesion | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle();

  return {
    supabase,
    userId: user.id,
    email: user.email ?? null,
    plan: comoPlan(perfil?.plan),
  };
}
