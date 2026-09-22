import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type Message = Database['public']['Tables']['messages']['Row']

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Al cambiar de chat había que vaciar primero: si no, durante la carga
    // se seguían viendo los mensajes de la conversación anterior bajo el
    // nombre del cliente nuevo.
    setMessages([])

    if (!conversationId) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (cancelled) return
        setMessages(data ?? [])
        setLoading(false)
      })

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const next = payload.new as Message
          // El mensaje del propio panel ya se pintó al enviarlo; sin este
          // filtro llegaba duplicado por Realtime.
          setMessages((current) => (current.some((m) => m.id === next.id) ? current : [...current, next]))
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  return { messages, loading }
}
