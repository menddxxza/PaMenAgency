import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  allAccepted,
  categories,
  defaultConsent,
  readConsent,
  writeConsent,
  type Consent,
} from '@/lib/consent'
import { Button } from '@/components/ui/Button'

/**
 * Banner de consentimiento.
 *
 * Mientras no haya decisión no se activa ninguna categoría distinta de las
 * necesarias, y las necesarias se limitan a recordar esta misma elección.
 * Rechazar es tan accesible como aceptar: mismo nivel, misma visibilidad.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [settings, setSettings] = useState(false)
  const [draft, setDraft] = useState<Consent>(defaultConsent)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = readConsent()
    if (!stored) {
      setVisible(true)
      return
    }
    setDraft(stored.value)
  }, [])

  // El pie y la página de preferencias pueden reabrir el panel.
  useEffect(() => {
    const onOpen = () => {
      const stored = readConsent()
      if (stored) setDraft(stored.value)
      setSettings(true)
      setVisible(true)
    }
    window.addEventListener('pm-consent-open', onOpen)
    return () => window.removeEventListener('pm-consent-open', onOpen)
  }, [])

  useEffect(() => {
    if (!visible) return
    panelRef.current?.focus()
  }, [visible, settings])

  if (!visible) return null

  const decide = (value: Consent) => {
    writeConsent(value)
    setVisible(false)
    setSettings(false)
  }

  return (
    <div className="pm-cookie">
      <div
        className="pm-cookie__panel"
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="false"
        aria-labelledby="pm-cookie-title"
      >
        <h2 id="pm-cookie-title" style={{ fontSize: 'var(--fs-h4)', marginBottom: '0.6rem' }}>
          {settings ? 'Configurar cookies' : 'Cookies'}
        </h2>

        {!settings && (
          <p style={{ color: 'var(--pm-muted)', fontSize: '0.93rem' }}>
            Usamos almacenamiento técnico para que la web funcione y para recordar esta elección.
            Las categorías de estadísticas y marketing están desactivadas hasta que las aceptes.
            Puedes cambiar tu decisión cuando quieras desde el pie de página. Más detalle en la{' '}
            <Link to="/legal/cookies" className="pm-link" style={{ display: 'inline' }}>
              política de cookies
            </Link>
            .
          </p>
        )}

        {settings && (
          <div style={{ marginTop: '0.5rem' }}>
            {categories.map((cat) => (
              <div className="pm-cookie__cat" key={cat.key}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{cat.titulo}</p>
                  <p style={{ color: 'var(--pm-muted)', fontSize: '0.85rem' }}>{cat.texto}</p>
                </div>
                <button
                  type="button"
                  className="pm-switch"
                  role="switch"
                  aria-checked={cat.obligatoria ? true : draft[cat.key]}
                  aria-label={cat.titulo}
                  disabled={cat.obligatoria}
                  onClick={() =>
                    setDraft((prev) => ({ ...prev, [cat.key]: !prev[cat.key] }))
                  }
                />
              </div>
            ))}
          </div>
        )}

        <div className="pm-cookie__actions">
          {!settings && (
            <Button variant="solid" onClick={() => setSettings(true)}>
              Configurar
            </Button>
          )}
          <Button variant="ghost" onClick={() => decide(defaultConsent)}>
            Rechazar
          </Button>
          {settings ? (
            <Button onClick={() => decide(draft)}>Guardar preferencias</Button>
          ) : (
            <Button onClick={() => decide(allAccepted)}>Aceptar todas</Button>
          )}
        </div>
      </div>
    </div>
  )
}
