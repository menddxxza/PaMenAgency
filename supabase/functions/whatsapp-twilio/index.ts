// Webhook para probar el bot con el sandbox de WhatsApp de Twilio (sin cuenta de
// Meta). Mismo flujo que whatsapp-webhook: registra el mensaje con el RPC
// handle_inbound_message, pide la respuesta a generate-bot-reply y contesta.
// Twilio admite la respuesta en la propia petición (TwiML), así que aquí no hace
// falta enviar nada por la API ni guardar ningún token de envío.
//
// Desplegar SIN verify_jwt: Twilio no manda JWT de Supabase. La autenticidad se
// comprueba con X-Twilio-Signature (HMAC-SHA1 con el Auth Token de Twilio); sin
// TWILIO_AUTH_TOKEN o con firma incorrecta se rechaza (falla cerrado).
//
// Secreto necesario: TWILIO_AUTH_TOKEN
// URL a poner en Twilio (When a message comes in, POST):
//   https://<ref>.supabase.co/functions/v1/whatsapp-twilio
//
// Solo para pruebas: el sandbox comparte un número de Twilio y cada persona debe
// unirse enviando "join <palabra>". El negocio se asocia poniendo ese número del
// sandbox en businesses.whatsapp_number.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
// La firma de Twilio se calcula sobre la URL pública exacta; detrás del gateway
// de Supabase req.url puede no coincidir, así que se construye a mano.
const PUBLIC_URL = Deno.env.get('TWILIO_WEBHOOK_URL') ?? `${SUPABASE_URL}/functions/v1/whatsapp-twilio`

const digits = (s: string) => s.replace(/\D/g, '')

const twiml = (text?: string) =>
  new Response(
    text
      ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')}</Message></Response>`
      : '<?xml version="1.0" encoding="UTF-8"?><Response/>',
    { status: 200, headers: { 'Content-Type': 'text/xml' } },
  )

async function validSignature(params: URLSearchParams, header: string | null): Promise<boolean> {
  if (!AUTH_TOKEN || !header) return false
  const sortedKeys = Array.from(new Set(params.keys())).sort()
  const data = PUBLIC_URL + sortedKeys.map((k) => k + (params.get(k) ?? '')).join('')
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(AUTH_TOKEN),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  )
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data)))
  const expected = btoa(String.fromCharCode(...mac))
  if (expected.length !== header.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ header.charCodeAt(i)
  return diff === 0
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const params = new URLSearchParams(await req.text())
  if (!(await validSignature(params, req.headers.get('X-Twilio-Signature')))) {
    return new Response('Firma no válida', { status: 401 })
  }

  const from = digits(params.get('From') ?? '')
  const to = digits(params.get('To') ?? '')
  const body = params.get('Body')?.trim()
  // Sin texto (imagen, audio...) o sin remitente: no se responde automáticamente.
  if (!from || !to || !body) return twiml()

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, whatsapp_number')
    .not('whatsapp_number', 'is', null)
  const business = (businesses ?? []).find((b) => digits(b.whatsapp_number ?? '') === to)
  if (!business) {
    console.error('Mensaje para un número sin negocio asociado:', to)
    return twiml()
  }

  const { data: messageId, error: rpcError } = await supabase.rpc('handle_inbound_message', {
    p_business_id: business.id,
    p_phone: `+${from}`,
    p_content: body,
    p_client_name: params.get('ProfileName'),
    p_sender: 'client',
  })
  if (rpcError || !messageId) {
    console.error('handle_inbound_message falló', rpcError?.message)
    return twiml()
  }

  const { data: saved } = await supabase
    .from('messages')
    .select('conversation_id')
    .eq('id', messageId)
    .single()
  if (!saved) return twiml()

  const botRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-bot-reply`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ business_id: business.id, conversation_id: saved.conversation_id }),
  })
  if (!botRes.ok) {
    console.error('generate-bot-reply falló', botRes.status, await botRes.text())
    return twiml()
  }
  const bot = await botRes.json()
  return twiml(bot.handoff ? undefined : bot.reply)
})
