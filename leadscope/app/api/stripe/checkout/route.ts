import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripeClient, STRIPE_PRICES } from '@/lib/stripe';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { interval } = await request.json().catch(() => ({ interval: 'monthly' }));
  const priceId = interval === 'yearly' ? STRIPE_PRICES.proYearly : STRIPE_PRICES.proMonthly;

  if (!priceId) {
    return NextResponse.json({ error: 'Precio de Stripe no configurado' }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single();

  const stripe = stripeClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  let customerId = profile?.stripe_customer_id ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/dashboard/billing?checkout=success`,
    cancel_url: `${siteUrl}/dashboard/billing?checkout=cancelled`,
    client_reference_id: user.id,
    subscription_data: { metadata: { supabase_user_id: user.id } },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
