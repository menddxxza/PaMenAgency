import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/context/TenantContext'
import type { Database } from '@/types/database.types'

type Business = Database['public']['Tables']['businesses']['Row']
type BotConfig = Database['public']['Tables']['bot_config']['Row']

export function useBusinessSettings() {
  const { activeBusinessId } = useTenant()
  const [business, setBusiness] = useState<Business | null>(null)
  const [botConfig, setBotConfig] = useState<BotConfig | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!activeBusinessId) return
    setLoading(true)
    const [{ data: businessRow }, { data: botRow }] = await Promise.all([
      supabase.from('businesses').select('*').eq('id', activeBusinessId).single(),
      supabase.from('bot_config').select('*').eq('business_id', activeBusinessId).single(),
    ])
    setBusiness(businessRow ?? null)
    setBotConfig(botRow ?? null)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBusinessId])

  return { business, botConfig, loading, refresh }
}
