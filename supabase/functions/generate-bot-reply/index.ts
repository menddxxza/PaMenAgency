// Edge Function que genera con IA la respuesta automática a una consulta
// frecuente de WhatsApp. Se llama justo después de registrar el mensaje
// entrante del cliente; esta función solo decide QUÉ responder.
//
// Proveedor de IA, por orden de preferencia según el secreto que exista:
//   1. GROQ_API_KEY      Groq (capa gratuita, API compatible con OpenAI)
//   2. GEMINI_API_KEY    Gemini (capa gratuita de Google AI Studio)
//   3. ANTHROPIC_API_KEY Anthropic (de pago por uso)
// Ojo con las capas gratuitas: los proveedores pueden usar los datos para mejorar
// sus productos, no usarlas con datos sensibles (p. ej. clínicas).
//
// Si bot_config.faq_auto_reply está desactivado, o el modelo no encuentra
// la respuesta en la base de conocimiento del negocio, se devuelve
// { handoff: true } y quien llama debe dejar la conversación para un humano en
// vez de enviar nada automático.
//
// POST /functions/v1/generate-bot-reply
// Headers: Authorization: Bearer <service_role_key>
// { "business_id": "uuid", "conversation_id": "uuid" }

import { createClient } from 'jsr:@supabase/supabase-js@2'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') ?? ''
const GROQ_MODEL = Deno.env.get('GROQ_MODEL') ?? 'llama-3.3-70b-versatile'
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? ''
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash'
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const HANDOFF_MARKER = 'HANDOFF_HUMANO'
const HISTORY_LIMIT = 10
// Lo que ve la clienta cuando el bot no sabe responder: mejor eso que el silencio.
const FALLBACK_REPLY =
  'Gracias por escribirnos 😊 Esto lo tiene que ver el equipo; te respondemos en cuanto podamos.'
// Freno de seguridad frente a bucles o abuso (cada respuesta gasta cuota de IA).
const MAX_BOT_REPLIES_PER_HOUR = 20

interface Faq {
  question: string
  answer: string
}

interface Service {
  name: string
  price_cents: number
}

interface Turn {
  role: 'user' | 'assistant'
  text: string
}

function formatHours(hours: Record<string, unknown> | null): string {
  const lines = Object.entries(hours ?? {})
    .filter(([key, value]) => key !== 'provisional' && typeof value === 'string')
    .map(([day, range]) => `- ${day}: ${range}`)
  return lines.length ? lines.join('\n') : '(horario no configurado: no lo indiques, el equipo lo confirmará)'
}

function formatServices(services: Service[]): string {
  if (!services.length) return '(sin servicios configurados)'
  return services
    .map((s) => `- ${s.name}: ${(s.price_cents / 100).toFixed(2).replace('.00', '').replace('.', ',')} €`)
    .join('\n')
}

function buildSystemPrompt(
  businessName: string,
  tone: string,
  services: Service[],
  hours: Record<string, unknown> | null,
  faqs: Faq[],
): string {
  const faqBlock = faqs.length
    ? faqs.map((f) => `P: ${f.question}\nR: ${f.answer}`).join('\n\n')
    : '(sin preguntas frecuentes configuradas todavía)'

  return `Eres el asistente de WhatsApp de "${businessName}". Responde en tono ${tone}, en español, en 1-3 frases cortas.

INFORMACIÓN DEL NEGOCIO (tu única fuente de verdad)

Servicios y precios:
${formatServices(services)}

Horario:
${formatHours(hours)}

Preguntas frecuentes:
${faqBlock}

REGLAS
- Usa solo la información de arriba. Nunca inventes precios, horarios, promociones, disponibilidad ni datos del negocio.
- Si la clienta quiere una cita: si aún no lo ha dicho, pregúntale qué servicio y qué día y hora le vendrían bien. Cuando lo tengas, dile que el equipo lo revisará y le confirmará la cita. Nunca confirmes tú una cita ni digas que ya está reservada.
- No des consejos médicos ni de salud.
- Si la pregunta no está cubierta por la información de arriba, o es para cancelar o cambiar una cita, un cobro o una queja, responde EXACTAMENTE con el texto "${HANDOFF_MARKER}" y nada más.`
}

// Junta mensajes seguidos del mismo autor (p. ej. dos del cliente sin respuesta
// del bot entre medias) y descarta los turnos iniciales del asistente: los dos
// proveedores esperan que la conversación empiece por el usuario.
function normalizeTurns(turns: Turn[]): Turn[] {
  const merged: Turn[] = []
  for (const t of turns) {
    const last = merged[merged.length - 1]
    if (last && last.role === t.role) last.text += `\n${t.text}`
    else merged.push({ ...t })
  }
  while (merged.length && merged[0].role !== 'user') merged.shift()
  return merged
}

async function askGemini(system: string, turns: Turn[]): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: turns.map((t) => ({
          role: t.role === 'user' ? 'user' : 'model',
          parts: [{ text: t.text }],
        })),
        // Sin "thinking": las respuestas son cortas y los tokens de razonamiento
        // se descuentan de maxOutputTokens, pudiendo dejar la respuesta vacía.
        generationConfig: { maxOutputTokens: 400, thinkingConfig: { thinkingBudget: 0 } },
      }),
    },
  )
  if (!res.ok) throw new Error(`Gemini respondió ${res.status}: ${await res.text()}`)
  const body = await res.json()
  return (body.candidates?.[0]?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? '')
    .join('')
    .trim()
}

async function askGroq(system: string, turns: Turn[]): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      // Los modelos gpt-oss "razonan" y esos tokens cuentan contra el límite:
      // se pide poco razonamiento y margen de sobra para que la respuesta no quede vacía.
      ...(GROQ_MODEL.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low', max_tokens: 1000 } : { max_tokens: 300 }),
      messages: [{ role: 'system', content: system }, ...turns.map((t) => ({ role: t.role, content: t.text }))],
    }),
  })
  if (!res.ok) throw new Error(`Groq respondió ${res.status}: ${await res.text()}`)
  const body = await res.json()
  return (body.choices?.[0]?.message?.content ?? '').trim()
}

async function askAnthropic(system: string, turns: Turn[]): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 300,
      system,
      messages: turns.map((t) => ({ role: t.role, content: t.text })),
    }),
  })
  if (!res.ok) throw new Error(`Anthropic respondió ${res.status}: ${await res.text()}`)
  const body = await res.json()
  return (body.content ?? [])
    .filter((block: { type: string }) => block.type === 'text')
    .map((block: { text: string }) => block.text)
    .join('')
    .trim()
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Supabase solo exige "algún JWT válido" por defecto, lo cual incluye la
  // sesión de cualquier usuario autenticado. Como esta función lee/escribe en
  // nombre de CUALQUIER business_id que le pasen, hay que comprobar
  // explícitamente que el caller trae la service_role key.
  if (req.headers.get('Authorization') !== `Bearer ${SERVICE_ROLE_KEY}`) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
  }
  if (!GROQ_API_KEY && !GEMINI_API_KEY && !ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'Falta GROQ_API_KEY, GEMINI_API_KEY o ANTHROPIC_API_KEY' }), {
      status: 500,
    })
  }

  const body = await req.json().catch(() => null)
  if (!body?.business_id || !body?.conversation_id) {
    return new Response(JSON.stringify({ error: 'business_id y conversation_id son obligatorios' }), { status: 400 })
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', SERVICE_ROLE_KEY)

  const [{ data: business }, { data: botConfig }, { data: conversation }] = await Promise.all([
    supabase.from('businesses').select('name, opening_hours').eq('id', body.business_id).single(),
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

  const { count: recentBotReplies } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', body.conversation_id)
    .eq('sender', 'bot')
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
  if ((recentBotReplies ?? 0) >= MAX_BOT_REPLIES_PER_HOUR) {
    return new Response(JSON.stringify({ handoff: true, reason: 'límite de respuestas automáticas por hora' }), {
      status: 200,
    })
  }

  const { data: services } = await supabase
    .from('services')
    .select('name, price_cents')
    .eq('business_id', body.business_id)
    .eq('active', true)
    .order('name')

  const faqs = (botConfig.knowledge_base?.faqs ?? []) as Faq[]
  const systemPrompt = buildSystemPrompt(
    business.name,
    botConfig.tone,
    (services ?? []) as Service[],
    business.opening_hours as Record<string, unknown> | null,
    faqs,
  )
  const turns = normalizeTurns(
    orderedHistory.map((m) => ({ role: m.sender === 'client' ? 'user' : 'assistant', text: m.content }) as Turn),
  )

  let reply: string
  try {
    reply = GROQ_API_KEY
      ? await askGroq(systemPrompt, turns)
      : GEMINI_API_KEY
        ? await askGemini(systemPrompt, turns)
        : await askAnthropic(systemPrompt, turns)
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e instanceof Error ? e.message : e) }), { status: 502 })
  }

  // Si el modelo no sabe (o devuelve vacío) se contesta con un aviso amable en vez
  // de dejar a la clienta sin respuesta; el dueño verá la conversación en el panel.
  if (!reply || reply.includes(HANDOFF_MARKER)) reply = FALLBACK_REPLY

  await supabase.from('messages').insert({
    conversation_id: body.conversation_id,
    sender: 'bot',
    content: reply,
  })
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString(), last_sender: 'bot' })
    .eq('id', body.conversation_id)

  return new Response(JSON.stringify({ handoff: false, reply }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
