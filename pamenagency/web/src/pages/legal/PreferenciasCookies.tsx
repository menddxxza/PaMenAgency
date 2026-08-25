import { useEffect } from 'react'
import { LegalPage } from './LegalPage'
import { Button } from '@/components/ui/Button'
import { categories, openCookieSettings, useConsent } from '@/lib/consent'

/** Página que permite revisar y cambiar la elección ya guardada. */
export default function PreferenciasCookies() {
  const { consent, date, ready } = useConsent()

  // Al llegar aquí desde el pie o desde un enlace, el panel se abre solo.
  useEffect(() => {
    if (ready) openCookieSettings()
  }, [ready])

  return (
    <LegalPage
      title="Preferencias de cookies"
      description="Consulta y modifica en cualquier momento qué categorías de cookies has aceptado en la web de PaMenAgency."
      path="/legal/preferencias-cookies"
    >
      <h2>Tu elección actual</h2>

      {!ready && <p>Cargando tus preferencias…</p>}

      {ready && !consent && (
        <p>
          Todavía no has hecho ninguna elección. Sólo está activo el almacenamiento técnico
          necesario para que la web funcione.
        </p>
      )}

      {ready && consent && (
        <>
          <ul>
            {categories.map((c) => (
              <li key={c.key}>
                <strong>{c.titulo}: </strong>
                {c.obligatoria || consent[c.key] ? (
                  <span className="pm-gold">aceptadas</span>
                ) : (
                  <span className="pm-muted">rechazadas</span>
                )}
              </li>
            ))}
          </ul>
          {date && (
            <p className="pm-muted" style={{ marginTop: '1rem', fontSize: 'var(--fs-small)' }}>
              Elección registrada el {new Date(date).toLocaleDateString('es-ES')}.
            </p>
          )}
        </>
      )}

      <p style={{ marginTop: '1.75rem' }}>
        <Button onClick={openCookieSettings} arrow>
          Cambiar mis preferencias
        </Button>
      </p>

      <h2>Qué significa cada categoría</h2>
      <ul>
        {categories.map((c) => (
          <li key={c.key}>
            <strong>{c.titulo}: </strong>
            {c.texto}
          </li>
        ))}
      </ul>
    </LegalPage>
  )
}
