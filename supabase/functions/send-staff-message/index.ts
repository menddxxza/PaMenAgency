// Envía a la clienta un mensaje escrito por el dueño o el equipo desde el panel
// (sección Clientes o Conversaciones) y, solo si el canal lo acepta, lo guarda
// en la conversación. Así el panel nunca enseña como "enviado" algo que no salió.
//
// Canales: WhatsApp (Cloud API, con el WHATSAPP_TOKEN y el
// businesses.whatsapp_phone_number_id del negocio) y Telegram (clientes cuyo
// teléfono es "tg:<chat_id>", solo pruebas, con TELEGRAM_BOT_TOKEN).
//
// POST /functions/v1/send-staff-message
// Headers: Authorization: Bearer <access_token del usuario logueado>
// { "conversation_id": "uuid", "content": "texto" }
//
// Solo puede usarla quien pertenece al negocio de esa conversación.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN') ?? ''
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') ?? ''
const GRAPH_VERSION = 'v21.0'
const MAX_LENGTH = 1500

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

// Error 131047 de Meta: han pasado más de 24 h desde el último mensaje de la
// clienta y WhatsApp solo deja escribirle con una plantilla aprobada.
function friendlyWhatsAppError(detail: string): string {
  if (detail.includes('131047') || detail.includes('131026')) {
    return 'WhatsApp solo permite escribir libremente hasta 24 h después del último mensaje de la clienta. Espera a que ella escriba de nuevo.'
  }
  return 'No se pudo enviar por WhatsApp. Inténtalo de nuevo en un momento.'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'No autenticado' }, 401)

  const body = await req.json().catch(() => null)
  const content = typeof body?.content === 'string' ? body.content.trim() : ''
  if (!body?.conversation_id || !content) return json({ error: 'conversation_id y content son obligatorios' }, 400)
  if (content.length > MAX_LENGTH) return json({ error: `El mensaje supera los ${MAX_LENGTH} caracteres` }, 400)

  // Quién llama: se valida el token del usuario, no se fía de nada del cuerpo.
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
  if (userError || !userData.user) return json({ error: 'No autenticado' }, 401)

  const { data: conversation } = await supabaseAdmin
    .from('conversations')
    .select('id, business_id, client_id')
    .eq('id', body.conversation_id)
    .single()
  if (!conversation) return json({ error: 'Conversación no encontrada' }, 404)

  // Pertenencia al negocio: sin esto cualquier usuario podría escribir en nombre de otro.
  const { data: membership } = await supabaseAdmin
    .from('business_users')
    .select('id')
    .eq('business_id', conversation.business_id)
    .eq('user_id', userData.user.id)
    .maybeSingle()
  if (!membership) return json({ error: 'No tienes acceso a este negocio' }, 403)

  const [{ data: client }, { data: business }] = await Promise.all([
    supabaseAdmin.from('clients').select('phone').eq('id', conversation.client_id).single(),
    supabaseAdmin.from('businesses').select('whatsapp_phone_number_id').eq('id', conversation.business_id).single(),
  ])
  if (!client) return json({ error: 'Cliente no encontrado' }, 404)

  if (client.phone.startsWith('tg:')) {
    if (!TELEGRAM_BOT_TOKEN) return json({ error: 'Telegram no está configurado' }, 500)
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: client.phone.slice(3), text: content }),
    })
    if (!res.ok) {
      console.error('Telegram falló', res.status, await res.text())
      return json({ error: 'No se pudo enviar por Telegram' }, 502)
    }
  } else {
    if (!business?.whatsapp_phone_number_id || !WHATSAPP_TOKEN) {
      return json({ error: 'El WhatsApp de este negocio todavía no está conectado' }, 409)
    }
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${business.whatsapp_phone_number_id}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: client.phone.replace(/\D/g, ''),
        type: 'text',
        text: { body: content },
      }),
    })
    if (!res.ok) {
      const detail = await res.text()
      console.error('WhatsApp falló', res.status, detail)
      return json({ error: friendlyWhatsAppError(detail) }, 502)
    }
  }

  const { error: insertError } = await supabaseAdmin
    .from('messages')
    .insert({ conversation_id: conversation.id, sender: 'staff', content })
  if (insertError) {
    console.error('El mensaje salió pero no se pudo guardar', insertError.message)
    return json({ error: 'El mensaje se envió pero no se pudo guardar en el panel' }, 500)
  }
  await supabaseAdmin
    .from('conversations')
    .update({ last_message_at: new Date().toISOString(), last_sender: 'staff' })
    .eq('id', conversation.id)

  return json({ ok: true })
})
