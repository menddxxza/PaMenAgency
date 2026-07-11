import { useState } from 'react'
import { useConversations } from '@/hooks/useConversations'
import { useMessages } from '@/hooks/useMessages'

export function Conversaciones() {
  const { conversations, loading } = useConversations()
  const [activeId, setActiveId] = useState<string | null>(null)
  const { messages } = useMessages(activeId)

  return (
    <div className="page conversaciones">
      <aside className="conversaciones__list">
        {loading && <p>Cargando…</p>}
        {conversations.map((c) => (
          <button
            key={c.id}
            className={`conversaciones__item ${c.id === activeId ? 'is-active' : ''}`}
            onClick={() => setActiveId(c.id)}
          >
            <span>{c.status}</span>
            <span>{new Date(c.last_message_at).toLocaleTimeString('es-ES')}</span>
          </button>
        ))}
      </aside>

      <section className="conversaciones__thread">
        {!activeId && <p>Selecciona una conversación</p>}
        {messages.map((m) => (
          <div key={m.id} className={`message message--${m.sender}`}>
            {m.content}
          </div>
        ))}
      </section>
    </div>
  )
}
