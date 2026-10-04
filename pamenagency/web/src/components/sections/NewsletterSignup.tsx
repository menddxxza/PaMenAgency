import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { site } from '@/content/site'
import { enviarLead, type EstadoEnvio } from '@/lib/lead'
import { obtenerUtm } from '@/lib/utm'

/**
 * Aviso de nuevas guías del Centro de Conocimiento.
 *
 * No es un boletín automatizado de verdad: no hay ninguna plataforma de
 * email marketing conectada. Lo que hace es enviar el email por el mismo
 * canal que cualquier otro lead (`enviarLead`), etiquetado como suscripción,
 * para que quede recogido y se pueda avisar a mano cuando salga una guía
 * nueva. Si en el futuro se conecta un proveedor real (Mailchimp, Resend
 * Broadcasts…), este componente es el único sitio que hay que tocar.
 */
export function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | EstadoEnvio>('idle')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const limpio = email.trim()
    if (!limpio || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpio)) {
      setError('Escribe un email válido.')
      document.getElementById('pm-newsletter-email')?.focus()
      return
    }
    setError(null)
    setStatus('sending')

    const resultado = await enviarLead({
      payload: {
        nombre: 'Suscripción al Centro de Conocimiento',
        email: limpio,
        necesidad: 'Suscripción al Centro de Conocimiento',
        mensaje: 'Quiere recibir un aviso cuando publiquemos una guía nueva en el Centro de Conocimiento.',
        score: 2,
        ...obtenerUtm(),
      },
      asunto: 'Suscripción al Centro de Conocimiento',
      cuerpo: `Nueva suscripción a avisos de guías: ${limpio}`,
    })

    setStatus(resultado)
    if (resultado === 'sent') setEmail('')
  }

  if (status === 'sent') {
    return (
      <p className="pm-row" style={{ color: 'var(--pm-gold)' }}>
        <Icon name="check" size={16} />
        Listo. Te avisamos cuando salga una guía nueva.
      </p>
    )
  }

  return (
    <form className="pm-newsletter" onSubmit={onSubmit} noValidate>
      {!compact && (
        <p className="pm-newsletter__texto">
          Avisamos cuando publicamos una guía nueva. Sin spam ni cesión de datos a terceros.
        </p>
      )}
      <div className="pm-newsletter__campo">
        <label htmlFor="pm-newsletter-email" className="pm-sr-only">
          Email
        </label>
        <input
          id="pm-newsletter-email"
          className="pm-input"
          type="email"
          placeholder="tu@email.com"
          value={email}
          aria-invalid={!!error}
          aria-describedby={error ? 'pm-newsletter-email-err' : undefined}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError(null)
          }}
        />
        <Button type="submit" disabled={status === 'sending'} size="sm">
          {status === 'sending' ? 'Enviando…' : 'Avísame'}
        </Button>
      </div>
      {error && (
        <p className="pm-error" id="pm-newsletter-email-err" role="alert">
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
      {status === 'mail' && (
        <p style={{ color: 'var(--pm-muted)', fontSize: 'var(--fs-small)' }} role="status">
          Hemos abierto tu programa de correo. Si no se ha abierto, escríbenos a {site.email}.
        </p>
      )}
      {status === 'error' && (
        <p className="pm-error" role="alert">
          <Icon name="alert" size={14} />
          No hemos podido registrarlo. Escríbenos a {site.email}.
        </p>
      )}
    </form>
  )
}
