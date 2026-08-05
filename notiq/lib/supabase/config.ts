/**
 * Notiq puede desplegarse antes de que exista el proyecto de Supabase. Cuando no hay
 * credenciales las páginas muestran un aviso de configuración en lugar de reventar,
 * así que hace falta poder preguntarlo antes de construir ningún cliente.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function supabaseConfigurado(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
