import { Telegraf } from 'telegraf'
import { env } from '../common/env.js'
import { audit } from '../common/logger.js'
import { chatWithLocalModel, type ChatMessage } from '../common/ollama.js'
import { BASE_RULES, toneStyle, type Tone } from '../common/personas.js'
import { loadCommands } from './commands.js'
import { runShellCommand } from './exec.js'

// Bot personal: solo responde a los chat_id de OWNER_CHAT_IDS. Puede
// ejecutar comandos de shell en esta máquina (acceso amplio, tal como se
// pidió), así que el token de este bot y la lista de owners son tan
// sensibles como una contraseña de root — trátalos igual. Ver README.md
// para las recomendaciones de despliegue (máquina propia, no compartida).

const bot = new Telegraf(env.personalBotToken())
const owners = new Set(env.ownerChatIds())
const commands = loadCommands()

const PENDING_TTL_MS = 60_000
const pendingExec = new Map<number, { cmd: string; expires: number }>()
const tone = new Map<number, Tone>()
const history = new Map<number, ChatMessage[]>()
const HISTORY_LIMIT = 12

bot.use(async (ctx, next) => {
  const chatId = ctx.chat?.id
  if (!chatId || !owners.has(chatId)) {
    audit('personal-bot', `mensaje ignorado de chat no autorizado ${chatId}`)
    return // no se responde: no confirmamos ni siquiera que el bot existe
  }
  return next()
})

bot.command('tono', (ctx) => {
  const value = ctx.message.text.split(' ')[1]?.trim() as Tone | undefined
  const valid: Tone[] = ['cercano', 'profesional', 'directo', 'divertido']
  if (!value || !valid.includes(value)) {
    ctx.reply(`Tonos disponibles: ${valid.join(', ')}. Uso: /tono profesional`)
    return
  }
  tone.set(ctx.chat.id, value)
  ctx.reply(`Tono cambiado a "${value}".`)
})

bot.command('comandos', (ctx) => {
  const list = Object.entries(commands)
  if (!list.length) {
    ctx.reply('No hay comandos predefinidos. Añádelos en commands.json (ver commands.example.json).')
    return
  }
  const text = list.map(([alias, e]) => `/comando ${alias} — ${e.description ?? e.cmd}`).join('\n')
  ctx.reply(text)
})

bot.command('comando', async (ctx) => {
  const alias = ctx.message.text.split(' ')[1]?.trim()
  const entry = alias ? commands[alias] : undefined
  if (!entry) {
    ctx.reply('Alias no encontrado. Usa /comandos para ver la lista.')
    return
  }
  await ctx.reply(`Ejecutando: ${entry.description ?? alias}…`)
  audit('personal-bot', `chat ${ctx.chat.id} ejecuta comando predefinido "${alias}": ${entry.cmd}`)
  const result = await runShellCommand(entry.cmd, entry.cwd ? `${env.workspaceDir}/${entry.cwd}` : undefined)
  audit('personal-bot', `resultado "${alias}" ok=${result.ok}`)
  await ctx.reply(result.output)
})

bot.command('exec', async (ctx) => {
  const cmd = ctx.message.text.split(' ').slice(1).join(' ').trim()
  if (!cmd) {
    ctx.reply('Uso: /exec <comando>. Te pediré confirmación antes de ejecutarlo.')
    return
  }
  pendingExec.set(ctx.chat.id, { cmd, expires: Date.now() + PENDING_TTL_MS })
  await ctx.reply(`¿Confirmas ejecutar esto en ${env.workspaceDir}?\n\`${cmd}\`\n\nResponde /confirmar (60s) o /cancelar.`, {
    parse_mode: 'Markdown',
  })
})

bot.command('confirmar', async (ctx) => {
  const pending = pendingExec.get(ctx.chat.id)
  pendingExec.delete(ctx.chat.id)
  if (!pending || pending.expires < Date.now()) {
    ctx.reply('No hay ningún comando pendiente de confirmación.')
    return
  }
  audit('personal-bot', `chat ${ctx.chat.id} confirma exec: ${pending.cmd}`)
  const result = await runShellCommand(pending.cmd)
  audit('personal-bot', `resultado exec ok=${result.ok}`)
  await ctx.reply(result.output)
})

bot.command('cancelar', (ctx) => {
  pendingExec.delete(ctx.chat.id)
  ctx.reply('Cancelado.')
})

bot.on('text', async (ctx) => {
  if (ctx.message.text.startsWith('/')) return

  const userText = ctx.message.text
  const chatHistory = history.get(ctx.chat.id) ?? []
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `${BASE_RULES}\nEres el asistente personal del dueño de este chat, hablando en confianza, no con un cliente.\n${toneStyle(tone.get(ctx.chat.id))}\nSi te piden ejecutar algo en el ordenador, recuérdales que usen /comando o /exec.`,
    },
    ...chatHistory,
    { role: 'user', content: userText },
  ]

  const reply = await chatWithLocalModel(messages)
  await ctx.reply(reply || '...')
  chatHistory.push({ role: 'user', content: userText }, { role: 'assistant', content: reply })
  history.set(ctx.chat.id, chatHistory.slice(-HISTORY_LIMIT))
})

bot.launch()
audit('personal-bot', `arrancado. Owners autorizados: ${[...owners].join(', ')}`)

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
