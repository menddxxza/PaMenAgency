import { cookies } from 'next/headers';

/**
 * Puerta del admin mientras no exista Supabase Auth (fase 2 del plan).
 *
 * Con ADMIN_TOKEN definido, /admin pide ese token y lo guarda en una cookie
 * httpOnly. Sin ADMIN_TOKEN: abierto en desarrollo, cerrado en producción,
 * porque el admin escribe con service_role.
 */

export const ADMIN_COOKIE = 'despiece-admin';

export type AdminAccess = 'ok' | 'needs-token' | 'disabled';

export function adminAccess(): AdminAccess {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return process.env.NODE_ENV === 'production' ? 'disabled' : 'ok';
  return cookies().get(ADMIN_COOKIE)?.value === token ? 'ok' : 'needs-token';
}

export function requireAdmin(): void {
  if (adminAccess() !== 'ok') throw new Error('No autorizado');
}
