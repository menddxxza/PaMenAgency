// Recibe los eventos de Stripe y mantiene `subscriptions` sincronizada.
// Esta es la ÚNICA fuente de verdad para el estado de pago — el frontend
// nunca marca una suscripción como activa por su cuenta, solo lee lo que
// este webhook escribió.
//
// Configurar en el dashboard de Stripe: Developers → Webhooks → Add endpoint
//   URL: https://<project-ref>.supabase.co/functions/v1/stripe-webhook
//   Eventos: checkout.session.completed, customer.subscription.updated,
//            customer.subscription.deleted
// y copiar el "Signing secret" a STRIPE_WEBHOOK_SECRET.

import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'

const PRICE_ENV_TO_PLAN: [string, string][] = [
  ['STRIPE_PRICE_STARTER', 'starter'],
  ['STRIPE_PRICE_PRO', 'pro'],
  ['STRIPE_PRICE_AGENCIA', 'agencia'],
]

// Colapsa los estados de Stripe (que incluyen incomplete_expired, unpaid…)
// al conjunto más chico que soporta la columna `status` de subscriptions.
function normalizeStatus(stripeStatus: string): string {
  if (['active', 'trialing', 'past_due', 'canceled'].includes(stripeStatus)) return stripeStatus
  return 'incomplete'
}

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2024-06-20' })
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature ?? '', webhookSecret)
  } catch (err) {
    return new Response(`Firma inválida: ${err instanceof Error ? err.message : err}`, { status: 400 })
  }

  const adminClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

  function planFromPriceId(priceId: string | undefined): string {
    for (const [envKey, plan] of PRICE_ENV_TO_PLAN) {
      if (Deno.env.get(envKey) === priceId) return plan
    }
    return 'starter'
  }

  async function upsertFromSubscription(subscription: Stripe.Subscription) {
    const businessId = subscription.metadata?.business_id
    if (!businessId) return // suscripción no creada desde nuestro checkout, ignorar

    const priceId = subscription.items.data[0]?.price?.id
    await adminClient.from('subscriptions').upsert(
      {
        business_id: businessId,
        stripe_customer_id: subscription.customer as string,
        stripe_subscription_id: subscription.id,
        plan: planFromPriceId(priceId),
        status: normalizeStatus(subscription.status),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'business_id' },
    )
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        await upsertFromSubscription(subscription)
      }
      break
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await upsertFromSubscription(subscription)
      break
    }
    default:
      // Otros eventos (invoice.*, payment_intent.*, etc.) no nos interesan.
      break
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
})
