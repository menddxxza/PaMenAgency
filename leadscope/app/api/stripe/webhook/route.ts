import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripeClient } from '@/lib/stripe';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const stripe = stripeClient();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook mal configurado' }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Firma inválida: ${err instanceof Error ? err.message : 'desconocido'}` },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();

  async function setPlanFromSubscription(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.supabase_user_id;
    const isActive = ['active', 'trialing'].includes(subscription.status);

    const query = supabase
      .from('profiles')
      .update({
        plan: isActive ? 'pro' : 'free',
        stripe_subscription_id: subscription.id,
        stripe_subscription_status: subscription.status,
      });

    if (userId) {
      await query.eq('id', userId);
    } else {
      await query.eq('stripe_customer_id', subscription.customer as string);
    }
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await setPlanFromSubscription(subscription);
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      await setPlanFromSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from('profiles')
        .update({ plan: 'free', stripe_subscription_status: 'canceled' })
        .eq('stripe_customer_id', subscription.customer as string);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
