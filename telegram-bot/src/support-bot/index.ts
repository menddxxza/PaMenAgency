import { Telegraf } from 'telegraf'
import { env } from '../common/env.js'
import { audit } from '../common/logger.js'
import { chatWithLocalModel, type ChatMessage } from '../common/ollama.js'
import { buildSupportSystemPrompt } from '../common/personas.js'
import { findLinkedBusiness, getBotConfig, getBusiness, sendInboundMessage } from './atiendeApi.js'

// Bot público de atención: cualquiera puede escribirle una vez conoce el
// enlace/usuario del bot. Solo hace lo que sabe hacer un agente de
// atención al cliente (hablar con el tono del negocio, usando el contexto
// que hay en bot_config) — no ejecuta comandos ni toca archivos. Para eso
// está el bot personal, que es un proyecto aparte.

const bot = new Telegraf(env.supportBotToken())

// Memoria de conversación en RAM: últimos mensajes por chat, nada más.
// No hace falta "entrenar" al bot con archivos: el tono y el contexto del
// negocio salen de bot_config (ya editable desde el panel de Atiende) y se
// inyectan en el system prompt en cada respuesta.
const HISTORY_LIMIT = 12
const history = new Map<number, ChatMessage[]>()
const linkedBusiness = new Map<number, { id: string; slug: string; name: string }>()

async function resolveBusiness(chatId: number) {
  const cached = linkedBusiness.get(chatId)
  if (cached) return cached

  const businessId = await findLinkedBusiness(chatId)
  if (!businessId) return null

  const { name, slug } = await getBusiness(businessId)
  const business = { id: businessId, slug, name }
  linkedBusiness.set(chatId, business)
  return business
}

bot.start(async (ctx) => {
  const slug = ctx.startPayload?.trim()
  if (!slug) {
    await ctx.reply(
      'Hola. Para empezar, dime el identificador de tu negocio en Atiende con:\n/vincular tu-negocio',
    )
    return
  }
  await link(ctx.chat.id, slug, ctx.reply.bind(ctx))
})

bot.command('vincular', async (ctx) => {
  const slug = ctx.message.text.split(' ').slice(1).join(' ').trim()
  if (!slug) {
    await ctx.reply('Uso: /vincular slug-de-tu-negocio')
    return
  }
  await link(ctx.chat.id, slug, ctx.reply.bind(ctx))
})

async function link(chatId: number, slug: string, reply: (text: string) => Promise<unknown>) {
  try {
    const { business_id } = await sendInboundMessage({
      businessSlug: slug,
      chatId,
      content: '(chat vinculado)',
      sender: 'client',
    })
    const { name } = await getBusiness(business_id)
    linkedBusiness.set(chatId, { id: business_id, slug, name })
    const config = await getBotConfig(business_id)
    await reply(config.greeting_message ?? `¡Hola! Ya estás en contacto con ${name}.`)
    audit('support-bot', `chat ${chatId} vinculado a negocio ${slug}`)
  } catch (err) {
    await reply(`No he podido vincular "${slug}". ¿El identificador es correcto?`)
    audit('support-bot', `error vinculando chat ${chatId} a "${slug}": ${(err as Error).message}`)
  }
}

bot.on('text', async (ctx) => {
  if (ctx.message.text.startsWith('/')) return // comandos ya gestionados arriba

  const business = await resolveBusiness(ctx.chat.id)
  if (!business) {
    await ctx.reply('Todavía no sé de qué negocio eres cliente. Usa /vincular slug-de-tu-negocio.')
    return
  }

  const userText = ctx.message.text
  const clientName = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ') || undefined

  try {
    await sendInboundMessage({
      businessSlug: business.slug,
      chatId: ctx.chat.id,
      content: userText,
      clientName,
      sender: 'client',
    })

    const config = await getBotConfig(business.id)
    const chatHistory = history.get(ctx.chat.id) ?? []

    const messages: ChatMessage[] = [
      { role: 'system', content: buildSupportSystemPrompt({ tone: config.tone, businessName: business.name, greeting: config.greeting_message, knowledgeBase: config.knowledge_base }) },
      ...chatHistory,
      { role: 'user', content: userText },
    ]

    const reply = await chatWithLocalModel(messages)
    await ctx.reply(reply || 'Perdona, no lo he entendido bien, ¿me lo puedes repetir?')

    chatHistory.push({ role: 'user', content: userText }, { role: 'assistant', content: reply })
    history.set(ctx.chat.id, chatHistory.slice(-HISTORY_LIMIT))

    await sendInboundMessage({
      businessSlug: business.slug,
      chatId: ctx.chat.id,
      content: reply,
      sender: 'bot',
    })
  } catch (err) {
    audit('support-bot', `error respondiendo a chat ${ctx.chat.id}: ${(err as Error).message}`)
    await ctx.reply('Ahora mismo no puedo responder, en breve te atiende alguien del equipo.')
  }
})

bot.launch()
audit('support-bot', 'arrancado (long polling, sin necesidad de URL pública)')

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
