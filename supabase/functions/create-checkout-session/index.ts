// Crea una sesión de Stripe Checkout (modo suscripción) para que un negocio
// contrate un plan. Devuelve la URL a la que el frontend redirige al
// usuario; Stripe se encarga del formulario de pago.
//
// POST /functions/v1/create-checkout-session
// Headers: Authorization: Bearer <access_token del usuario logueado>
// { "business_id": "uuid", "plan": "starter" | "pro" | "agencia" }
//
// Solo un 'owner' del negocio puede iniciar el checkout.

import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'

const PLAN_PRICE_ENV: Record<string, string> = {
  starter: 'STRIPE_PRICE_STARTER',
  pro: 'STRIPE_PRICE_PRO',
  agencia: 'STRIPE_PRICE_AGENCIA',
}

// El navegador llama a esta función directamente, así que necesita
// cabeceras CORS: sin ellas, el navegador bloquea la petición antes de que
// llegue al código de abajo y supabase-js solo reporta un error genérico
// ("Failed to send a request to the Edge Function").
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401, headers: corsHeaders })
  }

  const body = await req.json().catch(() => null)
  if (!body?.business_id || !body?.plan || !PLAN_PRICE_ENV[body.plan]) {
    return new Response(JSON.stringify({ error: 'business_id y plan (starter|pro|agencia) son obligatorios' }), {
      status: 400,
      headers: corsHeaders,
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: membership } = await callerClient
    .from('business_users')
    .select('role')
    .eq('business_id', body.business_id)
    .single()

  if (!membership || membership.role !== 'owner') {
    return new Response(JSON.stringify({ error: 'Solo el owner del negocio puede contratar un plan' }), {
      status: 403,
      headers: corsHeaders,
    })
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2024-06-20' })
  const priceId = Deno.env.get(PLAN_PRICE_ENV[body.plan]) ?? ''
  if (!priceId) {
    return new Response(JSON.stringify({ error: `Falta configurar ${PLAN_PRICE_ENV[body.plan]}` }), {
      status: 500,
      headers: corsHeaders,
    })
  }

  const adminClient = createClient(supabaseUrl, serviceKey)

  // Reusar el customer de Stripe si el negocio ya tenía uno (p.ej. probó otro
  // plan antes), para no duplicar clientes en Stripe.
  const { data: existingSub } = await adminClient
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('business_id', body.business_id)
    .single()

  let customerId = existingSub?.stripe_customer_id ?? undefined
  if (!customerId) {
    const customer = await stripe.customers.create({ metadata: { business_id: body.business_id } })
    customerId = customer.id
    await adminClient
      .from('subscriptions')
      .upsert({ business_id: body.business_id, stripe_customer_id: customerId }, { onConflict: 'business_id' })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/app?checkout=success`,
    cancel_url: `${siteUrl}/suscripcion?checkout=cancelled`,
    client_reference_id: body.business_id,
    subscription_data: {
      metadata: { business_id: body.business_id, plan: body.plan },
    },
  })

  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
