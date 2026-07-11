import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/context/TenantContext'
import type { Database } from '@/types/database.types'

type Client = Database['public']['Tables']['clients']['Row']

export function useClients() {
  const { activeBusinessId } = useTenant()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!activeBusinessId) return
    setLoading(true)
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('business_id', activeBusinessId)
      .order('name', { ascending: true })
    setClients(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBusinessId])

  return { clients, loading, refresh }
}
