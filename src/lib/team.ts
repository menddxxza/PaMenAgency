import { supabase } from '@/lib/supabase'
import type { BusinessRole } from '@/types/database.types'

export interface TeamMember {
  id: string
  user_id: string
  role: BusinessRole
  created_at: string
  email: string
}

// supabase-js no pone el JSON de error de la Edge Function en `error.message`
// (queda genérico, "non-2xx status code") — el body real con nuestro mensaje
// ("Solo el owner puede invitar…") vive en `error.context`, una Response cruda
// que hay que leer aparte.
async function assertOk<T>(data: T, error: { message: string; context?: Response } | null): Promise<T> {
  if (!error) return data
  if (error.context) {
    try {
      const body = await error.context.clone().json()
      if (body?.error) throw new Error(body.error)
    } catch {
      // el body no era JSON parseable — cae al mensaje genérico de abajo
    }
  }
  throw new Error(error.message)
}

export async function listMembers(businessId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase.functions.invoke('list-members', {
    body: { business_id: businessId },
  })
  return assertOk(data, error) as Promise<TeamMember[]>
}

export async function inviteMember(businessId: string, email: string, role: BusinessRole): Promise<void> {
  const { data, error } = await supabase.functions.invoke('invite-member', {
    body: { business_id: businessId, email, role },
  })
  await assertOk(data, error)
}

export async function removeMember(businessId: string, memberId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('remove-member', {
    body: { business_id: businessId, member_id: memberId },
  })
  await assertOk(data, error)
}
