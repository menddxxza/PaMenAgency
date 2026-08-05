import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './config';

/**
 * Cliente con service role: se salta RLS y el trigger que protege el plan.
 *
 * Solo lo usa el webhook de Stripe. No debe importarse desde ningún componente ni
 * desde ninguna ruta que reciba datos del usuario sin verificar antes la firma de
 * Stripe: con esta clave se puede escribir cualquier fila de cualquier usuario.
 */
export function createAdminClient(): SupabaseClient | null {
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !clave) return null;

  return createClient(SUPABASE_URL, clave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
