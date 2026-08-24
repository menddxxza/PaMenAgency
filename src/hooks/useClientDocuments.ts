import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type ClientDocument = Database['public']['Tables']['client_documents']['Row']

export function useClientDocuments(clientId: string) {
  const [documents, setDocuments] = useState<ClientDocument[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    const { data } = await supabase
      .from('client_documents')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    setDocuments(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  return { documents, loading, refresh }
}
