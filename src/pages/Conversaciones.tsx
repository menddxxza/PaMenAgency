import { useMemo, useState, type FormEvent } from 'react'
import { useConversations } from '@/hooks/useConversations'
import { useMessages } from '@/hooks/useMessages'
import { useClients } from '@/hooks/useClients'
import { sendStaffMessage, toggleConversationStatus } from '@/lib/mutations'
import { sendWhatsappMessageViaN8n } from '@/lib/n8n'
import { useTenant } from '@/context/TenantContext'

const SENDER_LABEL: Record<string, string> = {
  client: 'Cliente',
  bot: 'Bot',
  staff: 'Tú',
}

export function Conversaciones() {
  const { activeBusinessId } = useTenant()
  const { conversations, loading } = useConversations()
  const { clients } = useClients()
  const [activeId, setActiveId] = useState<string | null>(null)
  const { messages } = useMessages(activeId)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [deliveryWarning, setDeliveryWarning] = useState<string | null>(null)

  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients])
  const activeConversation = conversations.find((c) => c.id === activeId) ?? null

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!activeId || !activeBusinessId || !draft.trim() || !activeConversation) return
    setSending(true)
    setDeliveryWarning(null)
    const content = draft.trim()
    try {
      await sendStaffMessage(activeId, content)
      setDraft('')

      const phone = clientById.get(activeConversation.client_id)?.phone
      if (phone) {
        try {
          await sendWhatsappMessageViaN8n({
            businessId: activeBusinessId,
            conversationId: activeId,
            phone,
            content,
          })
        } catch {
          // El mensaje ya quedó guardado en Supabase; si n8n no está
          // configurado (webhook aún no enlazado) solo avisamos, no
          // bloqueamos el envío desde el panel.
          setDeliveryWarning('Guardado, pero no se pudo reenviar por WhatsApp (revisa la config. de n8n).')
        }
      }
    } finally {
      setSending(false)
    }
  }

  async function handleToggleStatus() {
    if (!activeConversation) return
    await toggleConversationStatus(activeConversation.id, activeConversation.status === 'open' ? 'closed' : 'open')
  }

  return (
    <div className="page conversaciones">
      <aside className="conversaciones__list">
        {loading && <p className="empty-state">Cargando…</p>}
        {!loading && conversations.length === 0 && <p className="empty-state">Sin conversaciones todavía.</p>}
        {conversations.map((c) => {
          const client = clientById.get(c.client_id)
          return (
            <button
              key={c.id}
              className={`conversaciones__item ${c.id === activeId ? 'is-active' : ''}`}
              onClick={() => setActiveId(c.id)}
            >
              <span className="conversaciones__item-top">
                <span>{client?.name || client?.phone || 'Cliente'}</span>
                <span className={`badge badge--${c.status}`}>{c.status === 'open' ? 'Abierta' : 'Cerrada'}</span>
              </span>
              <span className="conversaciones__item-time">
                {new Date(c.last_message_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </button>
          )
        })}
      </aside>

      <section className="conversaciones__thread">
        {!activeConversation && <div className="conversaciones__empty">Selecciona una conversación</div>}

        {activeConversation && (
          <>
            <div className="conversaciones__thread-header">
              <div>
                <strong>
                  {clientById.get(activeConversation.client_id)?.name ||
                    clientById.get(activeConversation.client_id)?.phone ||
                    'Cliente'}
                </strong>
              </div>
              <button className="btn btn--sm" onClick={handleToggleStatus}>
                {activeConversation.status === 'open' ? 'Cerrar conversación' : 'Reabrir'}
              </button>
            </div>

            <div className="conversaciones__messages">
              {messages.map((m) => (
                <div key={m.id} className={`message message--${m.sender}`}>
                  {m.content}
                  <span className="message__meta">
                    {SENDER_LABEL[m.sender]} ·{' '}
                    {new Date(m.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>

            {deliveryWarning && <p className="form-error" style={{ padding: '0 1.1rem' }}>{deliveryWarning}</p>}
            <form className="conversaciones__composer" onSubmit={handleSend}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escribe una respuesta…"
                disabled={sending}
              />
              <button type="submit" className="btn btn--primary" disabled={sending || !draft.trim()}>
                Enviar
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
