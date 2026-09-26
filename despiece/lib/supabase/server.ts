import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Dos clientes, a propósito:
 *
 *  - `db()`        anon key. Lee solo lo `published` porque RLS lo impone
 *                  (db/migrations/005_rls.sql). Es lo que usan las rutas
 *                  públicas.
 *  - `dbAdmin()`   service_role. Salta RLS. Solo para /admin y solo en el
 *                  servidor; si se filtra al cliente, se filtra la BD.
 */

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new ConfigError(name);
  return v;
}

export class ConfigError extends Error {
  constructor(public readonly variable: string) {
    super(`Falta la variable de entorno ${variable}`);
    this.name = 'ConfigError';
  }
}

const options = { auth: { persistSession: false } } as const;

let anonClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (!anonClient) {
    anonClient = createClient(env('NEXT_PUBLIC_SUPABASE_URL'), env('NEXT_PUBLIC_SUPABASE_ANON_KEY'), options);
  }
  return anonClient;
}

export function dbAdmin(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(env('NEXT_PUBLIC_SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), options);
  }
  return adminClient;
}

/** ¿Está configurada la conexión? Las rutas lo consultan para no reventar. */
export function isConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
