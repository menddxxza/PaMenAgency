// Webhook de un bot de Telegram para probar el "cerebro" de Atiende sin depender
// de WhatsApp/Meta. Mismo flujo que whatsapp-webhook: registra el mensaje con
// handle_inbound_message, pide la respuesta a generate-bot-reply y contesta.
// SOLO PARA PRUEBAS: todo chat de Telegram se asocia a un único negocio
// (TELEGRAM_BUSINESS_SLUG, por defecto el piloto All Nails) y el cliente se guarda
// con el teléfono ficticio "tg:<chat_id>".
//
// Desplegado SIN verify_jwt (Telegram no manda JWT de Supabase). La autenticidad
// se comprueba con la cabecera X-Telegram-Bot-Api-Secret-Token, que Telegram
// devuelve tal cual se configuró en setWebhook (secret_token). Sin secreto
// configurado o con cabecera distinta, se rechaza (falla cerrado).
//
// Secretos: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET

import { createClient } from 'jsr:@supabase/supabase-js@2'

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') ?? ''
const WEBHOOK_SECRET = Deno.env.get('TELEGRAM_WEBHOOK_SECRET') ?? ''
const BUSINESS_SLUG = Deno.env.get('TELEGRAM_BUSINESS_SLUG') ?? 'allnails-acg'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

interface TgUpdate {
  message?: {
    chat: { id: number }
    from?: { first_name?: string }
    text?: string
  }
}

async function sendTelegram(chatId: number, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
  if (!res.ok) console.error('Envío a Telegram falló', res.status, await res.text())
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const received = req.headers.get('X-Telegram-Bot-Api-Secret-Token') ?? ''
  if (!WEBHOOK_SECRET || !BOT_TOKEN || received !== WEBHOOK_SECRET) {
    return new Response('No autorizado', { status: 401 })
  }

  const update = (await req.json().catch(() => null)) as TgUpdate | null
  const msg = update?.message
  // Sin texto (foto, audio, etc.) no se responde automáticamente.
  if (!msg?.text) return new Response('ok')

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', BUSINESS_SLUG)
      .single()
    if (!business) {
      console.error('Negocio no encontrado para el slug', BUSINESS_SLUG)
      return new Response('ok')
    }

    const { data: messageId, error: rpcError } = await supabase.rpc('handle_inbound_message', {
      p_business_id: business.id,
      p_phone: `tg:${msg.chat.id}`,
      p_content: msg.text,
      p_client_name: msg.from?.first_name ?? null,
      p_sender: 'client',
    })
    if (rpcError || !messageId) {
      console.error('handle_inbound_message falló', rpcError?.message)
      return new Response('ok')
    }

    const { data: saved } = await supabase
      .from('messages')
      .select('conversation_id')
      .eq('id', messageId)
      .single()
    if (!saved) return new Response('ok')

    const botRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-bot-reply`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_id: business.id, conversation_id: saved.conversation_id }),
    })
    if (!botRes.ok) {
      console.error('generate-bot-reply falló', botRes.status, await botRes.text())
      return new Response('ok')
    }
    const bot = await botRes.json()
    if (!bot.handoff && bot.reply) await sendTelegram(msg.chat.id, bot.reply)
  } catch (e) {
    console.error('Error procesando mensaje de Telegram', e)
  }

  // Siempre 200: si no, Telegram reintenta y duplicaría mensajes.
  return new Response('ok')
})
