import type { Business } from '@/lib/types';

/** Cookie que recuerda qué negocio de la organización está activo en esta sesión. */
export const ACTIVE_BUSINESS_COOKIE = 'nx_active_business';

/**
 * Resuelve el negocio activo dentro de una lista de negocios de la misma
 * organización: el marcado por la cookie si sigue existiendo, o si no el
 * primero (el negocio original de la organización). Nunca null si `businesses`
 * tiene al menos un elemento.
 */
export function resolveActiveBusiness(
  businesses: Business[],
  activeBusinessId: string | null | undefined
): Business | null {
  if (businesses.length === 0) return null;
  const active = activeBusinessId ? businesses.find((b) => b.id === activeBusinessId) : undefined;
  return active ?? businesses[0];
}
