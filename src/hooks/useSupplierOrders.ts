import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/context/TenantContext'
import type { Database } from '@/types/database.types'

type SupplierOrder = Database['public']['Tables']['supplier_orders']['Row']

export function useSupplierOrders() {
  const { activeBusinessId } = useTenant()
  const [orders, setOrders] = useState<SupplierOrder[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!activeBusinessId) return
    setLoading(true)
    const { data } = await supabase
      .from('supplier_orders')
      .select('*')
      .eq('business_id', activeBusinessId)
      .order('ordered_at', { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBusinessId])

  return { orders, loading, refresh }
}
