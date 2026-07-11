import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/context/TenantContext'
import type { Database } from '@/types/database.types'

type Conversation = Database['public']['Tables']['conversations']['Row']

export function useConversations() {
  const { activeBusinessId } = useTenant()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeBusinessId) return

    let cancelled = false
    setLoading(true)

    supabase
      .from('conversations')
      .select('*')
      .eq('business_id', activeBusinessId)
      .order('last_message_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return
        setConversations(data ?? [])
        setLoading(false)
      })

    const channel = supabase
      .channel(`conversations:${activeBusinessId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `business_id=eq.${activeBusinessId}` },
        (payload) => {
          setConversations((current) => {
            if (payload.eventType === 'DELETE') {
              return current.filter((c) => c.id !== (payload.old as Conversation).id)
            }
            const next = payload.new as Conversation
            const withoutNext = current.filter((c) => c.id !== next.id)
            return [next, ...withoutNext].sort((a, b) => b.last_message_at.localeCompare(a.last_message_at))
          })
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [activeBusinessId])

  return { conversations, loading }
}
