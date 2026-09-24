import Stripe from 'stripe';

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY no está configurada');
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' });
}

export const STRIPE_PRICES = {
  basicMonthly: process.env.STRIPE_PRICE_BASIC_MONTHLY,
  plusMonthly: process.env.STRIPE_PRICE_PLUS_MONTHLY,
  proMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
};

export type PaidPlanId = 'basic' | 'plus' | 'pro';

export function priceIdForPlan(plan: PaidPlanId) {
  return { basic: STRIPE_PRICES.basicMonthly, plus: STRIPE_PRICES.plusMonthly, pro: STRIPE_PRICES.proMonthly }[plan];
}

export function planForPriceId(priceId: string | undefined): PaidPlanId | null {
  if (!priceId) return null;
  if (priceId === STRIPE_PRICES.basicMonthly) return 'basic';
  if (priceId === STRIPE_PRICES.plusMonthly) return 'plus';
  if (priceId === STRIPE_PRICES.proMonthly) return 'pro';
  return null;
}
