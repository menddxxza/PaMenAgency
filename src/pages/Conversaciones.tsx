import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useConversations } from '@/hooks/useConversations'
import { useMessages } from '@/hooks/useMessages'
import { useClients } from '@/hooks/useClients'
import { useToast } from '@/context/ToastContext'
import { usePageTitle } from '@/hooks/usePageTitle'
import { sendStaffMessage, toggleConversationStatus } from '@/lib/mutations'
import { sendWhatsappMessageViaN8n } from '@/lib/n8n'
import { useTenant } from '@/context/TenantContext'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonRows } from '@/components/ui/Skeleton'
import { IconInbox } from '@/components/layout/NavIcons'

const SENDER_LABEL: Record<string, string> = {
  client: 'Cliente',
  bot: 'Bot',
  staff: 'Tú',
}

export function Conversaciones() {
  usePageTitle('Conversaciones')
  const { activeBusinessId } = useTenant()
  const { conversations, loading } = useConversations()
  const { clients } = useClients()
  const { showToast } = useToast()
  const [activeId, setActiveId] = useState<string | null>(null)
  const { messages, loading: loadingMessages } = useMessages(activeId)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [deliveryWarning, setDeliveryWarning] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients])
  const activeConversation = conversations.find((c) => c.id === activeId) ?? null

  // Un chat que no baja solo al último mensaje no sirve: los que entraban por
  // Realtime quedaban fuera de pantalla y parecía que no había respuesta.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  function clientLabel(clientId: string) {
    const client = clientById.get(clientId)
    return client?.name || client?.phone || 'Cliente'
  }

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
          setDeliveryWarning('Guardado en el panel, pero no se ha podido reenviar por WhatsApp (revisa la config. de n8n).')
        }
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo enviar el mensaje', 'error')
    } finally {
      setSending(false)
    }
  }

  async function handleToggleStatus() {
    if (!activeConversation) return
    const next = activeConversation.status === 'open' ? 'closed' : 'open'
    try {
      await toggleConversationStatus(activeConversation.id, next)
      showToast(next === 'closed' ? 'Conversación cerrada' : 'Conversación reabierta')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo cambiar el estado', 'error')
    }
  }

  if (!loading && conversations.length === 0) {
    return (
      <div className="page">
        <div className="page__header">
          <div>
            <h1>Conversaciones</h1>
            <p>Los chats de WhatsApp de tu negocio, en directo.</p>
          </div>
        </div>
        <div className="card">
          <EmptyState
            icon={<IconInbox />}
            title="Aún no ha escrito nadie"
            description="Cuando un cliente escriba al WhatsApp del negocio, la conversación aparecerá aquí. El bot responde solo, y tú puedes tomar el control del chat en cualquier momento."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="page conversaciones">
      <aside className={`conversaciones__list ${activeConversation ? 'has-active' : ''}`} aria-label="Conversaciones">
        {loading && <SkeletonRows rows={6} />}
        {conversations.map((c) => (
          <button
            key={c.id}
            className={`conversaciones__item ${c.id === activeId ? 'is-active' : ''}`}
            onClick={() => setActiveId(c.id)}
            aria-current={c.id === activeId}
          >
            <span className="conversaciones__item-top">
              <span>{clientLabel(c.client_id)}</span>
              <span className={`badge badge--${c.status}`}>{c.status === 'open' ? 'Abierta' : 'Cerrada'}</span>
            </span>
            <span className="conversaciones__item-time">
              {new Date(c.last_message_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
          </button>
        ))}
      </aside>

      <section className={`conversaciones__thread ${!activeConversation ? 'is-hidden' : ''}`}>
        {!activeConversation && <div className="conversaciones__empty">Selecciona una conversación</div>}

        {activeConversation && (
          <>
            <div className="conversaciones__thread-header">
              <div className="conversaciones__thread-header-title">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm conversaciones__back-btn"
                  onClick={() => setActiveId(null)}
                  aria-label="Volver a conversaciones"
                >
                  ←
                </button>
                <strong>{clientLabel(activeConversation.client_id)}</strong>
              </div>
              <button className="btn btn--sm" onClick={handleToggleStatus}>
                {activeConversation.status === 'open' ? 'Cerrar conversación' : 'Reabrir'}
              </button>
            </div>

            <div className="conversaciones__messages">
              {loadingMessages && <SkeletonRows rows={4} />}
              {messages.map((m) => (
                <div key={m.id} className={`message message--${m.sender}`}>
                  {m.content}
                  <span className="message__meta">
                    {SENDER_LABEL[m.sender]} ·{' '}
                    {new Date(m.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {deliveryWarning && (
              <p className="form-error" style={{ padding: '0 1.1rem' }} role="alert">
                {deliveryWarning}
              </p>
            )}
            <form className="conversaciones__composer" onSubmit={handleSend}>
              <label className="sr-only" htmlFor="composer">
                Escribe una respuesta
              </label>
              <input
                id="composer"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escribe una respuesta…"
                disabled={sending}
                autoComplete="off"
              />
              <button type="submit" className="btn btn--primary" disabled={sending || !draft.trim()}>
                {sending ? 'Enviando…' : 'Enviar'}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
