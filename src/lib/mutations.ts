import { supabase } from '@/lib/supabase'
import type { AppointmentStatus, BotTone } from '@/types/database.types'

export async function createBusiness(name: string, slug: string, whatsappNumber?: string) {
  const { data, error } = await supabase.rpc('create_business', {
    p_name: name,
    p_slug: slug,
    p_whatsapp_number: whatsappNumber ?? null,
  })
  if (error) throw error
  return data as string
}

export async function upsertClient(businessId: string, phone: string, name?: string) {
  const { data, error } = await supabase
    .from('clients')
    .upsert({ business_id: businessId, phone, name }, { onConflict: 'business_id,phone' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createAppointment(input: {
  businessId: string
  clientId: string
  serviceId: string | null
  startsAt: string
  status?: AppointmentStatus
}) {
  const { error } = await supabase.from('appointments').insert({
    business_id: input.businessId,
    client_id: input.clientId,
    service_id: input.serviceId,
    starts_at: input.startsAt,
    status: input.status ?? 'pending',
    source: 'manual',
  })
  if (error) throw error
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
  if (error) throw error
}

export async function sendStaffMessage(conversationId: string, content: string) {
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender: 'staff',
    content,
  })
  if (error) throw error

  await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId)
}

export async function toggleConversationStatus(id: string, status: 'open' | 'closed') {
  const { error } = await supabase.from('conversations').update({ status }).eq('id', id)
  if (error) throw error
}

export async function createService(input: {
  businessId: string
  name: string
  priceCents: number
  durationMin: number
}) {
  const { error } = await supabase.from('services').insert({
    business_id: input.businessId,
    name: input.name,
    price_cents: input.priceCents,
    duration_min: input.durationMin,
  })
  if (error) throw error
}

export async function toggleServiceActive(id: string, active: boolean) {
  const { error } = await supabase.from('services').update({ active }).eq('id', id)
  if (error) throw error
}

export async function updateBotConfig(
  businessId: string,
  input: { tone: BotTone; greetingMessage: string },
) {
  const { error } = await supabase
    .from('bot_config')
    .update({ tone: input.tone, greeting_message: input.greetingMessage })
    .eq('business_id', businessId)
  if (error) throw error
}

export async function updateBusinessSettings(
  businessId: string,
  input: { name: string; whatsappNumber: string | null; timezone: string },
) {
  const { error } = await supabase
    .from('businesses')
    .update({ name: input.name, whatsapp_number: input.whatsappNumber, timezone: input.timezone })
    .eq('id', businessId)
  if (error) throw error
}
