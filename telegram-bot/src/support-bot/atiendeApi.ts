import { createClient } from '@supabase/supabase-js'
import { env } from '../common/env.js'

// Lecturas simples (negocio, vínculo del chat) se hacen directo contra
// Supabase con la service_role key, igual de confiable que un backend
// propio. Los *escritos* (mensajes) pasan por las Edge Functions, que son
// el mismo contrato que ya usa n8n para WhatsApp: así el esquema de la
// base de datos vive en un solo sitio.
const supabase = createClient(env.supabaseUrl(), env.supabaseServiceRoleKey())

async function callFunction<T>(name: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${env.supabaseUrl()}/functions/v1/${name}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.supabaseServiceRoleKey()}`,
      ...init.headers,
    },
  })
  const data = (await res.json()) as { error?: string } & T
  if (!res.ok) {
    throw new Error(data?.error ?? `${name} respondió ${res.status}`)
  }
  return data
}

export async function findLinkedBusiness(chatId: number) {
  const { data } = await supabase
    .from('telegram_links')
    .select('business_id')
    .eq('chat_id', chatId)
    .maybeSingle()
  return data?.business_id as string | undefined
}

export async function getBusiness(businessId: string) {
  const { data, error } = await supabase
    .from('businesses')
    .select('name, slug')
    .eq('id', businessId)
    .single()
  if (error) throw new Error(error.message)
  return data as { name: string; slug: string }
}

export type BotConfig = {
  tone: string | null
  greeting_message: string | null
  knowledge_base: Record<string, unknown> | null
}

export async function getBotConfig(businessId: string): Promise<BotConfig> {
  return callFunction<BotConfig>(`get-business-config?business_id=${businessId}`, {
    method: 'GET',
  })
}

export async function sendInboundMessage(opts: {
  businessSlug: string
  chatId: number
  content: string
  clientName?: string | null
  sender: 'client' | 'bot'
}) {
  return callFunction<{ message_id: string; business_id: string }>('telegram-inbound', {
    method: 'POST',
    body: JSON.stringify({
      business_slug: opts.businessSlug,
      chat_id: opts.chatId,
      content: opts.content,
      client_name: opts.clientName ?? null,
      sender: opts.sender,
    }),
  })
}
