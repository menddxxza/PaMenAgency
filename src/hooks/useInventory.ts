import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/context/TenantContext'
import type { Database } from '@/types/database.types'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

export function useInventory() {
  const { activeBusinessId } = useTenant()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!activeBusinessId) return
    setLoading(true)
    const { data } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('business_id', activeBusinessId)
      .order('name', { ascending: true })
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBusinessId])

  return { items, loading, refresh }
}
