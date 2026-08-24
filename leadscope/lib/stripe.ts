import Stripe from 'stripe';

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY no está configurada');
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' });
}

export const STRIPE_PRICES = {
  proMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  proYearly: process.env.STRIPE_PRICE_PRO_YEARLY,
};
