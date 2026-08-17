import Stripe from 'stripe';
import { PLANES, type Plan } from '@/lib/planes';

/**
 * Stripe es opcional: sin claves configuradas Notiq funciona entero, solo que nadie
 * puede pasar de Free. Por eso todo aquí devuelve null en lugar de lanzar al importar.
 */

let cliente: Stripe | null = null;

export function getStripe(): Stripe | null {
  const clave = process.env.STRIPE_SECRET_KEY;
  if (!clave) return null;

  if (!cliente) {
    cliente = new Stripe(clave, {
      // Fijar la versión de la API: si Stripe saca una nueva y la cuenta se
      // actualiza, los webhooks cambian de forma sin que nosotros toquemos nada.
      apiVersion: '2025-08-27.basil',
      appInfo: { name: 'Notiq' },
    });
  }

  return cliente;
}

/** Los planes de pago. Free no tiene precio en Stripe: es la ausencia de suscripción. */
export const PLANES_DE_PAGO = ['pro', 'team'] as const;
export type PlanDePago = (typeof PLANES_DE_PAGO)[number];

export function esPlanDePago(valor: unknown): valor is PlanDePago {
  return valor === 'pro' || valor === 'team';
}

/** Price ID de cada plan, desde el entorno. */
export function precioDe(plan: PlanDePago): string | null {
  const id = plan === 'pro' ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_TEAM;
  return id || null;
}

/**
 * Camino inverso: del price ID que viene en el webhook al plan.
 *
 * Se resuelve por price ID y no por el nombre del producto ni por metadata: el
 * nombre se puede editar desde el dashboard, y entonces un usuario que paga se
 * quedaría en Free sin que nadie se entere.
 */
export function planDesdePrecio(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro';
  if (priceId === process.env.STRIPE_PRICE_TEAM) return 'team';
  return null;
}

export function stripeConfigurado(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_PRO && process.env.STRIPE_PRICE_TEAM,
  );
}

/**
 * Estados de Stripe que dan derecho al plan de pago.
 *
 * `past_due` entra a propósito: el cobro ha fallado pero Stripe sigue reintentando
 * durante días. Cortarle el acceso a alguien que probablemente solo tiene la tarjeta
 * caducada es peor negocio que regalarle una semana; cuando Stripe se rinde manda
 * `customer.subscription.deleted` y ahí sí baja a Free.
 */
const ESTADOS_ACTIVOS = ['active', 'trialing', 'past_due'];

export function daDerechoAlPlan(estado: string): boolean {
  return ESTADOS_ACTIVOS.includes(estado);
}

export function nombreDelPlan(plan: Plan): string {
  return PLANES[plan].nombre;
}
