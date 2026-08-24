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
