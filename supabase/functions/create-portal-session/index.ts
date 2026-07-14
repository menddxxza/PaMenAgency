// Crea una sesión del Billing Portal de Stripe, donde el negocio puede
// cambiar de plan, actualizar la tarjeta o cancelar la suscripción sin
// que tengamos que construir esas pantallas nosotros.
//
// POST /functions/v1/create-portal-session
// Headers: Authorization: Bearer <access_token del usuario logueado>
// { "business_id": "uuid" }

import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.business_id) {
    return new Response(JSON.stringify({ error: 'business_id es obligatorio' }), { status: 400 })
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
    return new Response(JSON.stringify({ error: 'Solo el owner del negocio puede gestionar la facturación' }), {
      status: 403,
    })
  }

  const adminClient = createClient(supabaseUrl, serviceKey)
  const { data: sub } = await adminClient
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('business_id', body.business_id)
    .single()

  if (!sub?.stripe_customer_id) {
    return new Response(JSON.stringify({ error: 'Este negocio todavía no tiene una suscripción' }), { status: 400 })
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2024-06-20' })
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${siteUrl}/configuracion`,
  })

  return new Response(JSON.stringify({ url: portalSession.url }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
