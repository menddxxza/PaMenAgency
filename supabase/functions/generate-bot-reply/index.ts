// Edge Function que genera con IA la respuesta automática a una consulta
// frecuente de WhatsApp. n8n la llama justo después de registrar el mensaje
// entrante del cliente (whatsapp-inbound), en vez de construir el prompt
// dentro del propio workflow — así el "cerebro" del bot vive versionado en
// este repo y se puede probar/editar sin tocar n8n.
//
// n8n sigue siendo responsable de recibir/enviar los mensajes por la API de
// WhatsApp Business; esta función solo decide QUÉ responder.
//
// Si bot_config.faq_auto_reply está desactivado, o el modelo no encuentra
// la respuesta en la base de conocimiento del negocio, se devuelve
// { handoff: true } y n8n debe dejar la conversación para un humano en vez
// de enviar nada automático.
//
// POST /functions/v1/generate-bot-reply
// Headers: Authorization: Bearer <service_role_key>
// { "business_id": "uuid", "conversation_id": "uuid" }

import { createClient } from 'jsr:@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const HANDOFF_MARKER = 'HANDOFF_HUMANO'
const HISTORY_LIMIT = 10

interface Faq {
  question: string
  answer: string
}

function buildSystemPrompt(businessName: string, tone: string, faqs: Faq[]): string {
  const faqBlock = faqs.length
    ? faqs.map((f) => `P: ${f.question}\nR: ${f.answer}`).join('\n\n')
    : '(sin preguntas frecuentes configuradas todavía)'

  return `Eres el asistente de WhatsApp de "${businessName}". Responde en tono ${tone}, en español, en 1-3 frases cortas.

Solo puedes responder usando esta base de conocimiento del negocio:

${faqBlock}

Si la pregunta del cliente no está cubierta por la base de conocimiento, o pide algo que requiere una acción concreta (reservar, cancelar o mover una cita, un cobro, una queja), responde EXACTAMENTE con el texto "${HANDOFF_MARKER}" y nada más, para que un humano se haga cargo.`
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Supabase solo exige "algún JWT válido" por defecto, lo cual incluye la
  // sesión de cualquier usuario autenticado — no basta para garantizar que
  // quien llama es n8n. Como esta función lee/escribe en nombre de
  // CUALQUIER business_id que le pasen (para poder atender a cualquier
  // negocio sin conocer de antemano cuál), hay que comprobar explícitamente
  // que el caller trae la service_role key, o cualquier usuario podría leer
  // la base de conocimiento y el historial de otro negocio, o inyectar
  // mensajes de "bot" en su conversación.
  if (req.headers.get('Authorization') !== `Bearer ${SERVICE_ROLE_KEY}`) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
  }
  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY no está configurada' }), { status: 500 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.business_id || !body?.conversation_id) {
    return new Response(JSON.stringify({ error: 'business_id y conversation_id son obligatorios' }), { status: 400 })
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', SERVICE_ROLE_KEY)

  const [{ data: business }, { data: botConfig }, { data: conversation }] = await Promise.all([
    supabase.from('businesses').select('name').eq('id', body.business_id).single(),
    supabase
      .from('bot_config')
      .select('tone, faq_auto_reply, knowledge_base')
      .eq('business_id', body.business_id)
      .single(),
    supabase.from('conversations').select('id, client_id').eq('id', body.conversation_id).single(),
  ])

  if (!business || !botConfig || !conversation) {
    return new Response(JSON.stringify({ error: 'business_id o conversation_id no encontrados' }), { status: 404 })
  }

  if (!botConfig.faq_auto_reply) {
    return new Response(JSON.stringify({ handoff: true, reason: 'faq_auto_reply desactivado' }), { status: 200 })
  }

  const { data: history } = await supabase
    .from('messages')
    .select('sender, content')
    .eq('conversation_id', body.conversation_id)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT)

  const orderedHistory = (history ?? []).slice().reverse()
  if (orderedHistory.length === 0 || orderedHistory[orderedHistory.length - 1].sender !== 'client') {
    return new Response(JSON.stringify({ handoff: true, reason: 'no hay un mensaje de cliente pendiente de responder' }), {
      status: 200,
    })
  }

  const faqs = (botConfig.knowledge_base?.faqs ?? []) as Faq[]
  const systemPrompt = buildSystemPrompt(business.name, botConfig.tone, faqs)

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 300,
      system: systemPrompt,
      messages: orderedHistory.map((m) => ({
        role: m.sender === 'client' ? 'user' : 'assistant',
        content: m.content,
      })),
    }),
  })

  if (!anthropicRes.ok) {
    const detail = await anthropicRes.text()
    return new Response(JSON.stringify({ error: `Anthropic respondió ${anthropicRes.status}: ${detail}` }), {
      status: 502,
    })
  }

  const anthropicBody = await anthropicRes.json()
  const reply = (anthropicBody.content ?? [])
    .filter((block: { type: string }) => block.type === 'text')
    .map((block: { text: string }) => block.text)
    .join('')
    .trim()

  if (!reply || reply.includes(HANDOFF_MARKER)) {
    return new Response(JSON.stringify({ handoff: true, reason: 'fuera de la base de conocimiento' }), { status: 200 })
  }

  await supabase.from('messages').insert({
    conversation_id: body.conversation_id,
    sender: 'bot',
    content: reply,
  })
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', body.conversation_id)

  return new Response(JSON.stringify({ handoff: false, reply }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
