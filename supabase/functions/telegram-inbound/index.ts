// Edge Function que llama el bot de Telegram por cada mensaje entrante (o
// saliente del propio bot). Envuelve el RPC `handle_telegram_message` para
// que el bot no necesite conocer el esquema de la base de datos: solo este
// contrato, igual que whatsapp-inbound para n8n.
//
// Invocar con la service_role key (Authorization: Bearer <service_role_key>),
// nunca con la anon key, porque este endpoint escribe datos de cualquier
// negocio a partir de business_slug.
//
// POST /functions/v1/telegram-inbound
// {
//   "business_slug": "all-nails",
//   "chat_id": 123456789,
//   "content": "texto del mensaje",
//   "client_name": "opcional",
//   "sender": "client" | "bot"
// }

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.business_slug || body?.chat_id === undefined || !body?.content) {
    return new Response(
      JSON.stringify({ error: 'business_slug, chat_id y content son obligatorios' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const { data, error } = await supabase
    .rpc('handle_telegram_message', {
      p_business_slug: body.business_slug,
      p_chat_id: body.chat_id,
      p_content: body.content,
      p_client_name: body.client_name ?? null,
      p_sender: body.sender ?? 'client',
    })
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
