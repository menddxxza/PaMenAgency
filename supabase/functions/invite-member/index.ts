// Invita a una persona a un negocio: crea (o reutiliza) su usuario de
// Supabase Auth vía la Admin API y la vincula en `business_users`. El
// cliente llama a esto en vez de insertar en `business_users` directo
// porque esa tabla solo tiene policy de SELECT (ver 0001_init.sql) — el
// alta real requiere la service_role key, que nunca debe llegar al browser.
//
// POST /functions/v1/invite-member
// Headers: Authorization: Bearer <access_token del usuario logueado>
// { "business_id": "uuid", "email": "persona@ejemplo.com", "role": "staff" }
//
// Solo un 'owner' del negocio puede invitar.

import { createClient } from 'jsr:@supabase/supabase-js@2'

// El navegador (no n8n) llama a esta función directamente, así que necesita
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
  if (!body?.business_id || !body?.email || !body?.role) {
    return new Response(JSON.stringify({ error: 'business_id, email y role son obligatorios' }), {
      status: 400,
      headers: corsHeaders,
    })
  }
  if (!['owner', 'staff', 'agency'].includes(body.role)) {
    return new Response(JSON.stringify({ error: 'role inválido' }), { status: 400, headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  // Cliente "como el usuario que llama", para respetar RLS y confirmar que
  // de verdad es owner de ese negocio antes de tocar nada con la service key.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: membership } = await callerClient
    .from('business_users')
    .select('role')
    .eq('business_id', body.business_id)
    .single()

  if (!membership || membership.role !== 'owner') {
    return new Response(JSON.stringify({ error: 'Solo el owner del negocio puede invitar personas' }), {
      status: 403,
      headers: corsHeaders,
    })
  }

  const adminClient = createClient(supabaseUrl, serviceKey)

  const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(body.email, {
    redirectTo: body.redirect_to,
  })

  let userId = invited?.user?.id

  // Si ya existía como usuario (invitado a otro negocio antes), reusar su id.
  if (inviteError && inviteError.message?.toLowerCase().includes('already')) {
    const { data: existing } = await adminClient.auth.admin.listUsers()
    userId = existing?.users?.find((u) => u.email?.toLowerCase() === body.email.toLowerCase())?.id
  } else if (inviteError) {
    return new Response(JSON.stringify({ error: inviteError.message }), { status: 500, headers: corsHeaders })
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: 'No se pudo resolver el usuario invitado' }), {
      status: 500,
      headers: corsHeaders,
    })
  }

  const { error: linkError } = await adminClient
    .from('business_users')
    .upsert({ business_id: body.business_id, user_id: userId, role: body.role }, { onConflict: 'business_id,user_id' })

  if (linkError) {
    return new Response(JSON.stringify({ error: linkError.message }), { status: 500, headers: corsHeaders })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
