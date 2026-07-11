import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/context/TenantContext'
import type { Database } from '@/types/database.types'

type Service = Database['public']['Tables']['services']['Row']

export function useServices() {
  const { activeBusinessId } = useTenant()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!activeBusinessId) return
    setLoading(true)
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', activeBusinessId)
      .order('created_at', { ascending: true })
    setServices(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBusinessId])

  return { services, loading, refresh }
}
