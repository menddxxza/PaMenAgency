import { supabase } from '@/lib/supabase'
import type { PlanTier } from '@/types/database.types'

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

export async function createCheckoutSession(businessId: string, plan: PlanTier): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { business_id: businessId, plan },
  })
  const result = await assertOk(data, error)
  return (result as { url: string }).url
}

export async function createPortalSession(businessId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-portal-session', {
    body: { business_id: businessId },
  })
  const result = await assertOk(data, error)
  return (result as { url: string }).url
}
