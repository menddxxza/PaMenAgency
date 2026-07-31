import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigurado } from './config';

let cliente: SupabaseClient | null = null;

/** Segundos que puede quedarse obsoleto el catálogo. */
const FRESCURA = 60;

/**
 * Cliente sin cookies, para leer datos públicos del catálogo.
 *
 * Dos cosas que no son obvias y de las que depende que esto funcione:
 *
 * 1. No puede tocar cookies(). generateStaticParams y sitemap.ts se ejecutan durante
 *    `next build`, donde no hay petición: un cliente de sesión ahí revienta el build.
 *
 * 2. Hay que declarar la revalidación en cada fetch. Next cachea por defecto los GET
 *    que hace supabase-js, así que sin esto una ficha recién aprobada no aparecía en
 *    el catálogo: la página seguía sirviendo la respuesta cacheada de antes. Y no basta
 *    con poner la página en force-dynamic, porque lo que se cachea es el fetch, no la
 *    página.
 */
export function createPublicClient(): SupabaseClient | null {
  if (!supabaseConfigurado()) return null;

  if (!cliente) {
    cliente = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) =>
          fetch(input, { ...init, next: { revalidate: FRESCURA } } as RequestInit),
      },
    });
  }

  return cliente;
}
