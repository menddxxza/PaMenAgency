import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export const ANALYTICS_EVENTS = [
  'signup',
  'business_created',
  'audit_started',
  'audit_completed',
  'opportunity_viewed',
  'opportunity_activated',
  'agent_created',
  'agent_started',
  'lead_created',
  'lead_contacted',
  'conversion_created',
  'revenue_recorded',
  'subscription_started',
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

/**
 * Registra un evento de producto en `audit_log` (best-effort, nunca bloquea
 * el flujo principal) y por consola en desarrollo. Se llama desde Route
 * Handlers server-side con el cliente de Supabase ya autenticado.
 */
export async function track(
  supabase: SupabaseClient<Database>,
  event: AnalyticsEvent,
  params: { organizationId?: string | null; userId?: string | null; metadata?: Record<string, unknown> } = {}
) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[analytics]', event, params.metadata ?? {});
  }
  try {
    await supabase.from('audit_log').insert({
      organization_id: params.organizationId ?? null,
      user_id: params.userId ?? null,
      event,
      metadata: (params.metadata ?? {}) as never,
    });
  } catch {
    // No bloquear el flujo de producto por un fallo de analítica.
  }
}
