import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { site } from '@/content/site'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const GREETING =
  'Hola. Soy el asistente de IA de PaMenAgency: puedo contarte qué hacemos, ayudarte a elegir un servicio o resolver dudas sobre inteligencia artificial. Como sistema automático, puedo equivocarme — para algo importante, mejor contáctanos directamente.'

/**
 * Asistente conversacional embebido en toda la web.
 *
 * Llama a `/api/chat` (función serverless con la API de Claude). La
 * conversación vive sólo en memoria del componente: no se guarda en el
 * navegador ni requiere consentimiento de cookies, porque no persiste nada.
 */
export function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const launcherRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  // Foco atrapado dentro del panel mientras está abierto, igual que el menú móvil.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        launcherRef.current?.focus()
        return
      }
      if (e.key !== 'Tab') return
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), textarea:not([disabled])',
      )
      if (!focusables?.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-16) }),
      })
      const data = (await res.json().catch(() => null)) as { reply?: string } | null
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            data?.reply ||
            `No he podido responder ahora mismo. Escríbenos a ${site.email}.`,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `No he podido conectar. Escríbenos a ${site.email} si el problema continúa.`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDownInput = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className="pm-assistant__launcher"
        aria-expanded={open}
        aria-controls="pm-assistant-panel"
        aria-label={open ? 'Cerrar el asistente de IA' : 'Abrir el asistente de IA'}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name={open ? 'close' : 'chat'} size={22} />
      </button>

      {open && (
        <div
          id="pm-assistant-panel"
          className="pm-assistant__panel"
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Asistente de IA de PaMenAgency"
        >
          <header className="pm-assistant__header">
            <div className="pm-row" style={{ gap: '0.5rem' }}>
              <span className="pm-assistant__avatar" aria-hidden="true">
                <Icon name="sparkles" size={16} />
              </span>
              <div>
                <p className="pm-assistant__title">Asistente PaMenAgency</p>
                <p className="pm-assistant__subtitle">
                  <span className="pm-badge pm-badge--gold" style={{ padding: '0.1rem 0.5rem' }}>
                    IA
                  </span>{' '}
                  Puede cometer errores
                </p>
              </div>
            </div>
            <button
              type="button"
              className="pm-assistant__close"
              aria-label="Cerrar el asistente"
              onClick={() => {
                setOpen(false)
                launcherRef.current?.focus()
              }}
            >
              <Icon name="close" size={16} />
            </button>
          </header>

          <div className="pm-assistant__body">
            <div className="pm-assistant__bubble pm-assistant__bubble--assistant">
              {GREETING}
            </div>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`pm-assistant__bubble pm-assistant__bubble--${m.role}`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div
                className="pm-assistant__bubble pm-assistant__bubble--assistant pm-assistant__typing"
                aria-live="polite"
              >
                <span />
                <span />
                <span />
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            className="pm-assistant__form"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <textarea
              ref={inputRef}
              className="pm-assistant__input"
              placeholder="Escribe cualquier cosa…"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDownInput}
              aria-label="Escribe tu mensaje al asistente"
            />
            <button
              type="submit"
              className="pm-assistant__send"
              disabled={!input.trim() || loading}
              aria-label="Enviar mensaje"
            >
              <Icon name="arrow" size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
