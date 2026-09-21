// Webhook público al que llama directamente Meta (WhatsApp Cloud API). Sustituye
// a n8n para el piloto: recibe el mensaje, lo registra con whatsapp-inbound,
// pide la respuesta a generate-bot-reply y la envía de vuelta por la API.
//
// Debe desplegarse SIN verify_jwt (Meta no manda JWT de Supabase). La
// autenticidad se comprueba con la firma X-Hub-Signature-256 (HMAC-SHA256 del
// cuerpo con el App Secret de la app de Meta); si falta el secreto o la firma
// no cuadra, se rechaza: el endpoint falla cerrado.
//
// Secretos necesarios (supabase secrets set ...):
//   WHATSAPP_VERIFY_TOKEN  texto libre que pones también en el panel de Meta
//   META_APP_SECRET        "App secret" de la app en developers.facebook.com
//   WHATSAPP_TOKEN         token de acceso de la Cloud API (permanente)
//
// El negocio se identifica por businesses.whatsapp_number (solo dígitos, con
// prefijo de país) frente al display_phone_number que Meta manda en cada evento.
// Si el bot no sabe responder (handoff), no se envía nada: el dueño lo ve en la
// bandeja de Conversaciones del panel.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') ?? ''
const APP_SECRET = Deno.env.get('META_APP_SECRET') ?? ''
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const GRAPH_VERSION = 'v21.0'

interface WaMessage {
  id: string
  from: string
  type: string
  text?: { body: string }
}

interface WaValue {
  metadata?: { display_phone_number?: string; phone_number_id?: string }
  contacts?: { wa_id: string; profile?: { name?: string } }[]
  messages?: WaMessage[]
}

const digits = (s: string) => s.replace(/\D/g, '')

async function validSignature(rawBody: string, header: string | null): Promise<boolean> {
  if (!APP_SECRET || !header?.startsWith('sha256=')) return false
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(APP_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  const received = header.slice('sha256='.length)
  if (received.length !== expected.length) return false
  // Comparación en tiempo constante.
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ received.charCodeAt(i)
  return diff === 0
}

async function sendWhatsAppText(phoneNumberId: string, to: string, body: string) {
  const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }),
  })
  if (!res.ok) console.error('Envío a WhatsApp falló', res.status, await res.text())
}

async function handleMessage(value: WaValue, msg: WaMessage) {
  // De momento solo texto: audios, imágenes, etc. no se responden automáticamente.
  if (msg.type !== 'text' || !msg.text?.body) return

  const displayNumber = digits(value.metadata?.display_phone_number ?? '')
  const phoneNumberId = value.metadata?.phone_number_id ?? ''
  if (!displayNumber || !phoneNumberId) return

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, whatsapp_number')
    .not('whatsapp_number', 'is', null)
  const business = (businesses ?? []).find((b) => digits(b.whatsapp_number ?? '') === displayNumber)
  if (!business) {
    console.error('Mensaje para un número sin negocio asociado:', displayNumber)
    return
  }

  const clientName = value.contacts?.find((c) => c.wa_id === msg.from)?.profile?.name ?? null

  const { data: messageId, error: rpcError } = await supabase.rpc('handle_inbound_message', {
    p_business_id: business.id,
    p_phone: `+${msg.from}`,
    p_content: msg.text.body,
    p_client_name: clientName,
    p_sender: 'client',
  })
  if (rpcError || !messageId) {
    console.error('handle_inbound_message falló', rpcError?.message)
    return
  }

  const { data: saved } = await supabase
    .from('messages')
    .select('conversation_id')
    .eq('id', messageId)
    .single()
  if (!saved) return

  const botRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-bot-reply`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ business_id: business.id, conversation_id: saved.conversation_id }),
  })
  if (!botRes.ok) {
    console.error('generate-bot-reply falló', botRes.status, await botRes.text())
    return
  }
  const bot = await botRes.json()
  if (bot.handoff || !bot.reply) return

  await sendWhatsAppText(phoneNumberId, msg.from, bot.reply)
}

async function processPayload(payload: { entry?: { changes?: { value?: WaValue }[] }[] }) {
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value
      if (!value?.messages) continue // estados de entrega, etc.
      for (const msg of value.messages) {
        try {
          await handleMessage(value, msg)
        } catch (e) {
          console.error('Error procesando mensaje', msg.id, e)
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const ok =
      VERIFY_TOKEN &&
      url.searchParams.get('hub.mode') === 'subscribe' &&
      url.searchParams.get('hub.verify_token') === VERIFY_TOKEN
    return ok
      ? new Response(url.searchParams.get('hub.challenge') ?? '', { status: 200 })
      : new Response('Forbidden', { status: 403 })
  }

  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const raw = await req.text()
  if (!(await validSignature(raw, req.headers.get('X-Hub-Signature-256')))) {
    return new Response('Firma no válida', { status: 401 })
  }

  let payload
  try {
    payload = JSON.parse(raw)
  } catch {
    return new Response('JSON no válido', { status: 400 })
  }

  // Meta reintenta si no recibe 200 rápido, y reintentar duplicaría mensajes:
  // se responde ya y se procesa en segundo plano.
  const work = processPayload(payload)
  // deno-lint-ignore no-explicit-any
  const runtime = (globalThis as any).EdgeRuntime
  if (runtime?.waitUntil) runtime.waitUntil(work)
  return new Response('ok', { status: 200 })
})
