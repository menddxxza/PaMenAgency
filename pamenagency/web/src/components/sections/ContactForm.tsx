import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { services } from '@/content/services'
import { site } from '@/content/site'

type Fields = {
  nombre: string
  empresa: string
  email: string
  telefono: string
  sector: string
  necesidad: string
  presupuesto: string
  mensaje: string
  consentimiento: boolean
}

const empty: Fields = {
  nombre: '',
  empresa: '',
  email: '',
  telefono: '',
  sector: '',
  necesidad: '',
  presupuesto: '',
  mensaje: '',
  consentimiento: false,
}

const sectores = [
  'Comercio o tienda',
  'Hostelería',
  'Salud o consulta',
  'Servicios profesionales',
  'Industria o taller',
  'Inmobiliaria',
  'Educación o formación',
  'Agencia o estudio',
  'Creación de contenido',
  'Particular (sin empresa)',
  'Otro',
]

const presupuestos = [
  'Todavía no lo sé',
  'Quiero empezar por algo pequeño',
  'Tengo un presupuesto definido',
  'Prefiero comentarlo primero',
]

/**
 * Formulario de contacto.
 *
 * Envío: si existe `VITE_CONTACT_ENDPOINT` se envía ahí por POST. Si no —que
 * es el estado actual, porque aún no hay backend—, se compone un correo con
 * los datos y se abre el cliente de correo del usuario. En ningún caso se
 * guarda nada en el navegador ni se envía a terceros.
 */
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined

function validate(values: Fields): Partial<Record<keyof Fields, string>> {
  const errors: Partial<Record<keyof Fields, string>> = {}

  if (values.nombre.trim().length < 2) errors.nombre = 'Indica tu nombre.'

  if (!values.email.trim()) errors.email = 'Necesitamos un email para responderte.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
    errors.email = 'Ese email no parece válido.'

  // El teléfono es opcional, pero si se rellena debe tener forma de teléfono.
  if (values.telefono.trim() && !/^[+\d][\d\s().-]{6,}$/.test(values.telefono.trim()))
    errors.telefono = 'Revisa el teléfono.'

  if (values.mensaje.trim().length < 10)
    errors.mensaje = 'Cuéntanos algo más, aunque sean dos líneas.'

  if (!values.consentimiento)
    errors.consentimiento = 'Necesitamos tu consentimiento para poder responderte.'

  return errors
}

export function ContactForm() {
  const [values, setValues] = useState<Fields>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'mail' | 'error'>('idle')

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)

    if (Object.keys(found).length > 0) {
      // El foco va al primer campo con error, no al principio del formulario.
      const firstKey = Object.keys(found)[0]
      document.getElementById(`pm-${firstKey}`)?.focus()
      return
    }

    if (ENDPOINT) {
      setStatus('sending')
      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })
        if (!res.ok) throw new Error(String(res.status))
        setStatus('sent')
        setValues(empty)
        return
      } catch {
        setStatus('error')
        return
      }
    }

    // Sin endpoint configurado: se abre el cliente de correo con todo relleno.
    const cuerpo = [
      `Nombre: ${values.nombre}`,
      values.empresa && `Empresa: ${values.empresa}`,
      `Email: ${values.email}`,
      values.telefono && `Teléfono: ${values.telefono}`,
      values.sector && `Sector: ${values.sector}`,
      values.necesidad && `Necesidad: ${values.necesidad}`,
      values.presupuesto && `Presupuesto: ${values.presupuesto}`,
      '',
      values.mensaje,
    ]
      .filter(Boolean)
      .join('\n')

    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      `Contacto web — ${values.nombre}`,
    )}&body=${encodeURIComponent(cuerpo)}`
    setStatus('mail')
  }

  if (status === 'sent') {
    return (
      <div className="pm-diag" style={{ textAlign: 'center' }}>
        <span style={{ color: 'var(--pm-gold)', display: 'inline-flex' }}>
          <Icon name="check" size={36} />
        </span>
        <h3 style={{ fontSize: 'var(--fs-h3)', marginBlock: '1rem 0.75rem' }}>Mensaje enviado</h3>
        <p style={{ color: 'var(--pm-muted)' }}>
          Te responderemos al email que nos has dejado. Si tu caso es sencillo, es posible que la
          respuesta sea directamente la solución.
        </p>
      </div>
    )
  }

  return (
    <form className="pm-diag" onSubmit={onSubmit} noValidate>
      <div
        className="pm-grid"
        style={{ gap: '1.1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}
      >
        <Field id="nombre" label="Nombre" required error={errors.nombre}>
          <input
            id="pm-nombre"
            className="pm-input"
            type="text"
            name="name"
            autoComplete="name"
            value={values.nombre}
            aria-invalid={!!errors.nombre}
            aria-describedby={errors.nombre ? 'pm-nombre-err' : undefined}
            onChange={(e) => set('nombre', e.target.value)}
          />
        </Field>

        <Field id="empresa" label="Empresa" error={errors.empresa}>
          <input
            id="pm-empresa"
            className="pm-input"
            type="text"
            autoComplete="organization"
            value={values.empresa}
            onChange={(e) => set('empresa', e.target.value)}
          />
        </Field>

        <Field id="email" label="Email" required error={errors.email}>
          <input
            id="pm-email"
            className="pm-input"
            type="email"
            autoComplete="email"
            value={values.email}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'pm-email-err' : undefined}
            onChange={(e) => set('email', e.target.value)}
          />
        </Field>

        <Field id="telefono" label="Teléfono" error={errors.telefono}>
          <input
            id="pm-telefono"
            className="pm-input"
            type="tel"
            autoComplete="tel"
            value={values.telefono}
            aria-invalid={!!errors.telefono}
            aria-describedby={errors.telefono ? 'pm-telefono-err' : undefined}
            onChange={(e) => set('telefono', e.target.value)}
          />
        </Field>

        <Field id="sector" label="Sector" error={errors.sector}>
          <select
            id="pm-sector"
            className="pm-select"
            value={values.sector}
            onChange={(e) => set('sector', e.target.value)}
          >
            <option value="">Selecciona…</option>
            {sectores.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field id="necesidad" label="¿Qué necesitas?" error={errors.necesidad}>
          <select
            id="pm-necesidad"
            className="pm-select"
            value={values.necesidad}
            onChange={(e) => set('necesidad', e.target.value)}
          >
            <option value="">Selecciona…</option>
            <option value="No lo tengo claro todavía">No lo tengo claro todavía</option>
            {services.map((s) => (
              <option key={s.slug} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div style={{ marginTop: '1.1rem' }}>
        <Field id="presupuesto" label="Presupuesto aproximado" error={errors.presupuesto}>
          <select
            id="pm-presupuesto"
            className="pm-select"
            value={values.presupuesto}
            onChange={(e) => set('presupuesto', e.target.value)}
          >
            <option value="">Selecciona…</option>
            {presupuestos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div style={{ marginTop: '1.1rem' }}>
        <Field id="mensaje" label="Mensaje" required error={errors.mensaje}>
          <textarea
            id="pm-mensaje"
            className="pm-textarea"
            value={values.mensaje}
            placeholder="Cuéntanos en qué situación estás. No hace falta que sea técnico."
            aria-invalid={!!errors.mensaje}
            aria-describedby={errors.mensaje ? 'pm-mensaje-err' : undefined}
            onChange={(e) => set('mensaje', e.target.value)}
          />
        </Field>
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <label className="pm-checkbox" htmlFor="pm-consentimiento">
          <input
            id="pm-consentimiento"
            type="checkbox"
            checked={values.consentimiento}
            aria-invalid={!!errors.consentimiento}
            onChange={(e) => set('consentimiento', e.target.checked)}
          />
          <span>
            He leído y acepto la{' '}
            <Link to="/legal/privacidad" className="pm-link" style={{ display: 'inline' }}>
              política de privacidad
            </Link>
            . Usaremos estos datos únicamente para responderte.
          </span>
        </label>
        {errors.consentimiento && (
          <p className="pm-error" style={{ marginTop: '0.5rem' }} id="pm-consentimiento-err">
            <Icon name="alert" size={14} />
            {errors.consentimiento}
          </p>
        )}
      </div>

      {status === 'error' && (
        <p className="pm-error" style={{ marginTop: '1rem' }} role="alert">
          <Icon name="alert" size={14} />
          No hemos podido enviar el mensaje. Escríbenos directamente a {site.email}.
        </p>
      )}

      {status === 'mail' && (
        <p style={{ marginTop: '1rem', color: 'var(--pm-muted)', fontSize: 'var(--fs-small)' }} role="status">
          Hemos abierto tu programa de correo con el mensaje preparado. Si no se ha abierto,
          escríbenos a {site.email}.
        </p>
      )}

      <div style={{ marginTop: '1.75rem' }}>
        <Button type="submit" disabled={status === 'sending'} arrow full>
          {status === 'sending' ? 'Enviando…' : 'Hablar con PA MEN AGENCY'}
        </Button>
      </div>
    </form>
  )
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="pm-field">
      <label className="pm-label" htmlFor={`pm-${id}`}>
        {label}
        {required && (
          <span className="pm-label__req" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="pm-sr-only"> (obligatorio)</span>}
      </label>
      {children}
      {error && (
        <p className="pm-error" id={`pm-${id}-err`}>
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
    </div>
  )
}
