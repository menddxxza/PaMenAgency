// Devuelve los miembros de un negocio con su email, resuelto vía la Admin
// API porque `business_users` no guarda el email (solo user_id) y el
// cliente no tiene acceso a auth.users.
//
// POST /functions/v1/list-members
// Headers: Authorization: Bearer <access_token del usuario logueado>
// { "business_id": "uuid" }

import { createClient } from 'jsr:@supabase/supabase-js@2'

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

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: membership } = await callerClient
    .from('business_users')
    .select('role')
    .eq('business_id', body.business_id)
    .single()

  if (!membership) {
    return new Response(JSON.stringify({ error: 'No tienes acceso a este negocio' }), { status: 403 })
  }

  const adminClient = createClient(supabaseUrl, serviceKey)

  const { data: members, error } = await adminClient
    .from('business_users')
    .select('id, user_id, role, created_at')
    .eq('business_id', body.business_id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const { data: usersPage } = await adminClient.auth.admin.listUsers()
  const emailById = new Map((usersPage?.users ?? []).map((u) => [u.id, u.email]))

  const result = (members ?? []).map((m) => ({
    id: m.id,
    user_id: m.user_id,
    role: m.role,
    created_at: m.created_at,
    email: emailById.get(m.user_id) ?? '—',
  }))

  return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } })
})
