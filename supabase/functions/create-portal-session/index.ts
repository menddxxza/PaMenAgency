// Crea una sesión del Billing Portal de Stripe, donde el negocio puede
// cambiar de plan, actualizar la tarjeta o cancelar la suscripción sin
// que tengamos que construir esas pantallas nosotros.
//
// POST /functions/v1/create-portal-session
// Headers: Authorization: Bearer <access_token del usuario logueado>
// { "business_id": "uuid" }

import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'

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
  if (!body?.business_id) {
    return new Response(JSON.stringify({ error: 'business_id es obligatorio' }), { status: 400, headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: caller } = await callerClient.auth.getUser()
  if (!caller?.user) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401, headers: corsHeaders })
  }

  // Filtrar también por user_id: la policy deja ver todas las filas del
  // negocio al que perteneces, no solo la propia, y sin este filtro
  // `.single()` falla en cuanto el negocio tiene más de un miembro.
  const { data: membership } = await callerClient
    .from('business_users')
    .select('role')
    .eq('business_id', body.business_id)
    .eq('user_id', caller.user.id)
    .single()

  if (!membership || membership.role !== 'owner') {
    return new Response(JSON.stringify({ error: 'Solo el owner del negocio puede gestionar la facturación' }), {
      status: 403,
      headers: corsHeaders,
    })
  }

  const adminClient = createClient(supabaseUrl, serviceKey)
  const { data: sub } = await adminClient
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('business_id', body.business_id)
    .single()

  if (!sub?.stripe_customer_id) {
    return new Response(JSON.stringify({ error: 'Este negocio todavía no tiene una suscripción' }), {
      status: 400,
      headers: corsHeaders,
    })
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2024-06-20' })
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${siteUrl}/configuracion`,
  })

  return new Response(JSON.stringify({ url: portalSession.url }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
