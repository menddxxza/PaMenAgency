// Edge Function que n8n llama por cada mensaje entrante (o saliente del bot)
// de WhatsApp Business. Envuelve el RPC `handle_inbound_message` para que n8n
// no necesite conocer el esquema de la base de datos, solo este contrato.
//
// Invocar con la service_role key (Authorization: Bearer <service_role_key>),
// nunca con la anon key, porque este endpoint escribe datos de cualquier
// negocio a partir de business_id.
//
// POST /functions/v1/whatsapp-inbound
// {
//   "business_id": "uuid",
//   "phone": "+34...",
//   "content": "texto del mensaje",
//   "client_name": "opcional",
//   "sender": "client" | "bot"
// }

import { createClient } from 'jsr:@supabase/supabase-js@2'

const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Supabase por defecto solo exige "algún JWT válido", lo cual incluye la
  // sesión de cualquier usuario autenticado, no solo n8n. Como este endpoint
  // escribe datos de cualquier business_id que le pasen, hay que comprobar
  // explícitamente que quien llama trae la service_role key (además, el RPC
  // handle_inbound_message ya tiene el EXECUTE restringido a service_role,
  // así que esta comprobación es cinturón y tirantes con esa).
  if (req.headers.get('Authorization') !== `Bearer ${SERVICE_ROLE_KEY}`) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.business_id || !body?.phone || !body?.content) {
    return new Response(JSON.stringify({ error: 'business_id, phone y content son obligatorios' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', SERVICE_ROLE_KEY)

  const { data, error } = await supabase.rpc('handle_inbound_message', {
    p_business_id: body.business_id,
    p_phone: body.phone,
    p_content: body.content,
    p_client_name: body.client_name ?? null,
    p_sender: body.sender ?? 'client',
  })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ message_id: data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
