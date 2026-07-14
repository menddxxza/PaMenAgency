import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/context/TenantContext'
import type { Database } from '@/types/database.types'

type Subscription = Database['public']['Tables']['subscriptions']['Row']

export function useSubscription() {
  const { activeBusinessId } = useTenant()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!activeBusinessId) return
    setLoading(true)
    const { data } = await supabase.from('subscriptions').select('*').eq('business_id', activeBusinessId).single()
    setSubscription(data ?? null)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBusinessId])

  const isActive = subscription ? ['active', 'trialing'].includes(subscription.status) : false

  return { subscription, isActive, loading, refresh }
}
