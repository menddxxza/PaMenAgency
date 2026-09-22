import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/context/TenantContext'
import type { Database } from '@/types/database.types'

type Invoice = Database['public']['Tables']['invoices']['Row']

export function useInvoices() {
  const { activeBusinessId } = useTenant()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!activeBusinessId) return
    setLoading(true)
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('business_id', activeBusinessId)
      .order('issue_date', { ascending: false })
    setInvoices(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBusinessId])

  return { invoices, loading, refresh }
}
