import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { site } from '@/content/site'
import { enviarLead, type EstadoEnvio } from '@/lib/lead'
import { obtenerUtm } from '@/lib/utm'

type Fields = {
  tuNombre: string
  tuEmail: string
  contactoReferido: string
}

const empty: Fields = { tuNombre: '', tuEmail: '', contactoReferido: '' }

/** Formulario de /referidos: quién recomienda y a quién. */
export function ReferralForm() {
  const [values, setValues] = useState<Fields>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | EstadoEnvio>('idle')

  const set = <K extends keyof Fields>(key: K, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found: Partial<Record<keyof Fields, string>> = {}
    if (values.tuNombre.trim().length < 2) found.tuNombre = 'Indica tu nombre.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.tuEmail.trim()))
      found.tuEmail = 'Ese email no parece válido.'
    if (values.contactoReferido.trim().length < 3)
      found.contactoReferido = 'Indica un nombre, email o teléfono de contacto.'
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setStatus('sending')
    const resultado = await enviarLead({
      payload: {
        nombre: values.tuNombre,
        email: values.tuEmail,
        necesidad: 'Programa de referidos',
        mensaje: `Contacto referido: ${values.contactoReferido}`,
        score: 2,
        ...obtenerUtm(),
      },
      asunto: `Referido de ${values.tuNombre}`,
      cuerpo: `${values.tuNombre} (${values.tuEmail}) recomienda a: ${values.contactoReferido}`,
    })
    setStatus(resultado)
    if (resultado === 'sent') setValues(empty)
  }

  if (status === 'sent') {
    return (
      <div className="pm-diag" style={{ textAlign: 'center' }}>
        <span style={{ color: 'var(--pm-gold)', display: 'inline-flex' }}>
          <Icon name="check" size={36} />
        </span>
        <h3 style={{ fontSize: 'var(--fs-h3)', marginBlock: '1rem 0.75rem' }}>Recibido</h3>
        <p style={{ color: 'var(--pm-muted)' }}>
          Contactaremos a la persona que nos indicas. En cuanto contrate un servicio, tu descuento
          queda disponible.
        </p>
      </div>
    )
  }

  return (
    <form className="pm-diag" onSubmit={onSubmit} noValidate>
      <div className="pm-grid" style={{ gap: '1.1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))' }}>
        <div className="pm-field">
          <label className="pm-label" htmlFor="pm-ref-nombre">
            Tu nombre<span className="pm-label__req" aria-hidden="true">*</span>
          </label>
          <input
            id="pm-ref-nombre"
            className="pm-input"
            type="text"
            value={values.tuNombre}
            aria-invalid={!!errors.tuNombre}
            onChange={(e) => set('tuNombre', e.target.value)}
          />
          {errors.tuNombre && (
            <p className="pm-error">
              <Icon name="alert" size={14} />
              {errors.tuNombre}
            </p>
          )}
        </div>

        <div className="pm-field">
          <label className="pm-label" htmlFor="pm-ref-email">
            Tu email<span className="pm-label__req" aria-hidden="true">*</span>
          </label>
          <input
            id="pm-ref-email"
            className="pm-input"
            type="email"
            value={values.tuEmail}
            aria-invalid={!!errors.tuEmail}
            onChange={(e) => set('tuEmail', e.target.value)}
          />
          {errors.tuEmail && (
            <p className="pm-error">
              <Icon name="alert" size={14} />
              {errors.tuEmail}
            </p>
          )}
        </div>
      </div>

      <div className="pm-field" style={{ marginTop: '1.1rem' }}>
        <label className="pm-label" htmlFor="pm-ref-contacto">
          A quién nos recomiendas (nombre, email o teléfono)
          <span className="pm-label__req" aria-hidden="true">*</span>
        </label>
        <input
          id="pm-ref-contacto"
          className="pm-input"
          type="text"
          value={values.contactoReferido}
          aria-invalid={!!errors.contactoReferido}
          onChange={(e) => set('contactoReferido', e.target.value)}
        />
        {errors.contactoReferido && (
          <p className="pm-error">
            <Icon name="alert" size={14} />
            {errors.contactoReferido}
          </p>
        )}
      </div>

      <TrustBadge />

      {status === 'error' && (
        <p className="pm-error" style={{ marginTop: '1rem' }} role="alert">
          <Icon name="alert" size={14} />
          No hemos podido enviarlo. Escríbenos a {site.email}.
        </p>
      )}
      {status === 'mail' && (
        <p style={{ marginTop: '1rem', color: 'var(--pm-muted)', fontSize: 'var(--fs-small)' }} role="status">
          Hemos abierto tu programa de correo. Si no se ha abierto, escríbenos a {site.email}.
        </p>
      )}

      <div style={{ marginTop: '1.75rem' }}>
        <Button type="submit" disabled={status === 'sending'} arrow full>
          {status === 'sending' ? 'Enviando…' : 'Recomendarnos'}
        </Button>
      </div>
    </form>
  )
}
