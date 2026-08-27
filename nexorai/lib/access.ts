/**
 * Cuentas con acceso completo sin coste, al margen de lo que diga
 * `organizations.plan` — pensado para cuentas internas/de prueba. No hay
 * cobro real conectado todavía (ver lib/plans.ts), así que hoy esto sólo
 * afecta a qué plan se muestra como "actual"; cuando se conecte Stripe,
 * este es el punto donde excluir a estas cuentas de cualquier paywall.
 */
const COMPLIMENTARY_EMAILS = ['mendozitadjerez@gmail.com'];

export function isComplimentaryAccess(email: string | null | undefined): boolean {
  if (!email) return false;
  return COMPLIMENTARY_EMAILS.includes(email.toLowerCase());
}

/**
 * Cuentas con acceso al panel de administrador de la plataforma (/admin),
 * que ve datos agregados de todas las organizaciones vía el cliente de
 * service role. No hay un rol "platform admin" en base de datos todavía
 * (no hace falta migración para esto) — mismo mecanismo que
 * `isComplimentaryAccess`.
 */
const PLATFORM_ADMIN_EMAILS = ['mendozitadjerez@gmail.com'];

export function isPlatformAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return PLATFORM_ADMIN_EMAILS.includes(email.toLowerCase());
}
