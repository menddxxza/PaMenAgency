import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useConversations } from '@/hooks/useConversations'
import { useMessages } from '@/hooks/useMessages'
import { useToast } from '@/context/ToastContext'
import { sendStaffMessage } from '@/lib/mutations'

const SENDER_LABEL: Record<string, string> = {
  client: 'Cliente',
  bot: 'Bot',
  staff: 'Tú',
}

// Chat con un cliente desde su ficha. Usa la conversación más reciente del
// cliente: si nunca ha escrito no hay conversación y no se puede iniciar una
// (WhatsApp solo permite escribir libremente a quien ha escrito antes).
export function ClientChat({ clientId }: { clientId: string }) {
  const { showToast } = useToast()
  const { conversations } = useConversations()
  const conversation = conversations
    .filter((c) => c.client_id === clientId)
    .sort((a, b) => b.last_message_at.localeCompare(a.last_message_at))[0]
  const { messages, loading } = useMessages(conversation?.id ?? null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!conversation || !draft.trim()) return
    setSending(true)
    try {
      await sendStaffMessage(conversation.id, draft.trim())
      setDraft('')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo enviar el mensaje', 'error')
    } finally {
      setSending(false)
    }
  }

  if (!conversation) {
    return <p className="empty-state">Este cliente todavía no ha escrito. Cuando lo haga podrás contestarle desde aquí.</p>
  }

  return (
    <div className="client-chat">
      <div className="client-chat__messages">
        {loading && <p className="empty-state">Cargando…</p>}
        {messages.map((m) => (
          <div key={m.id} className={`message message--${m.sender}`}>
            {m.content}
            <span className="message__meta">
              {SENDER_LABEL[m.sender]} ·{' '}
              {new Date(m.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form className="client-chat__composer" onSubmit={handleSend}>
        <label className="sr-only" htmlFor={`client-chat-${clientId}`}>
          Escribe una respuesta
        </label>
        <input
          id={`client-chat-${clientId}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escribe una respuesta…"
          disabled={sending}
          autoComplete="off"
        />
        <button type="submit" className="btn btn--primary btn--sm" disabled={sending || !draft.trim()}>
          {sending ? 'Enviando…' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}
