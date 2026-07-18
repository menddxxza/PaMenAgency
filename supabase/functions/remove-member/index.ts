// Quita a una persona de un negocio (borra su fila de business_users).
// Solo un owner puede hacerlo, y no puede quitarse a sí mismo si es el
// único owner (para no dejar el negocio sin dueño).
//
// POST /functions/v1/remove-member
// Headers: Authorization: Bearer <access_token del usuario logueado>
// { "business_id": "uuid", "member_id": "uuid de la fila business_users" }

import { createClient } from 'jsr:@supabase/supabase-js@2'

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
  if (!body?.business_id || !body?.member_id) {
    return new Response(JSON.stringify({ error: 'business_id y member_id son obligatorios' }), {
      status: 400,
      headers: corsHeaders,
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

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
    return new Response(JSON.stringify({ error: 'Solo el owner del negocio puede quitar personas' }), {
      status: 403,
      headers: corsHeaders,
    })
  }

  const adminClient = createClient(supabaseUrl, serviceKey)

  const { data: allMembers } = await adminClient
    .from('business_users')
    .select('id, role')
    .eq('business_id', body.business_id)

  const target = allMembers?.find((m) => m.id === body.member_id)
  const ownerCount = allMembers?.filter((m) => m.role === 'owner').length ?? 0

  if (target?.role === 'owner' && ownerCount <= 1) {
    return new Response(JSON.stringify({ error: 'No puedes quitar al único owner del negocio' }), {
      status: 400,
      headers: corsHeaders,
    })
  }

  const { error } = await adminClient.from('business_users').delete().eq('id', body.member_id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
