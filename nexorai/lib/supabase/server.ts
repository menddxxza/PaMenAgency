import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // set() llamado desde un Server Component: el middleware refresca la sesión.
          }
        },
      },
    }
  );
}

/**
 * Cliente con `service_role`: sólo se usa en Route Handlers server-side para
 * operaciones que deben saltarse RLS de forma controlada (p.ej. webhooks).
 * Nunca se importa desde un Client Component.
 */
export function createServiceRoleClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // El cliente de service role no gestiona sesión de usuario.
        },
      },
    }
  );
}
