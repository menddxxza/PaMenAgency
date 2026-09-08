import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { site } from '@/content/site'
import { obtenerUtm } from '@/lib/utm'
import { enviarLead, type EstadoEnvio } from '@/lib/lead'

type Fields = {
  nombre: string
  empresa: string
  email: string
  cargo: string
  tamano: string
  sector: string
  objetivo: string
  reto: string
  consentimiento: boolean
}

const empty: Fields = {
  nombre: '',
  empresa: '',
  email: '',
  cargo: '',
  tamano: '',
  sector: '',
  objetivo: '',
  reto: '',
  consentimiento: false,
}

const tamanos = [
  'Solo yo',
  'De 2 a 10 personas',
  'De 11 a 50 personas',
  'De 51 a 200 personas',
  'Más de 200 personas',
]

const sectores = [
  'Comercio o tienda',
  'Hostelería',
  'Salud o consulta',
  'Servicios profesionales',
  'Industria o taller',
  'Inmobiliaria',
  'Logística o transporte',
  'Educación o formación',
  'Agencia o estudio',
  'Otro',
]

const objetivos = [
  'Aumentar ingresos',
  'Reducir costes',
  'Automatizar operaciones',
  'Mejorar la atención al cliente',
  'Ganar productividad',
  'Todavía no lo sé',
]

/**
 * Puntuación del lead (1-5), en la misma escala que usa `ContactForm` y que
 * lee `api/lead.ts` para decidir el asunto del aviso.
 *
 * Quien pide una auditoría entra con 4: ha buscado un servicio concreto y de
 * pago, no está explorando. Sube a 5 si además hay una empresa con equipo
 * detrás, porque ahí el alcance del trabajo es mayor. No es una promesa de
 * atención distinta: sólo evita que un encargo real se mezcle con las
 * consultas exploratorias.
 */
function leadScore(values: Fields): number {
  const conEquipo = values.tamano !== '' && values.tamano !== 'Solo yo'
  return conEquipo ? 5 : 4
}

function validate(values: Fields): Partial<Record<keyof Fields, string>> {
  const errors: Partial<Record<keyof Fields, string>> = {}

  if (values.nombre.trim().length < 2) errors.nombre = 'Indica tu nombre.'

  if (!values.email.trim()) errors.email = 'Necesitamos un email para responderte.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
    errors.email = 'Ese email no parece válido.'

  if (values.empresa.trim().length < 2) errors.empresa = 'Indica el nombre de tu empresa.'

  if (!values.objetivo) errors.objetivo = 'Elige qué te gustaría mejorar, aunque sea aproximado.'

  // El backend exige un mensaje de 10 caracteres: aquí ese mensaje es el reto.
  if (values.reto.trim().length < 10)
    errors.reto = 'Cuéntanos dónde se atasca tu empresa, aunque sean dos líneas.'

  if (!values.consentimiento)
    errors.consentimiento = 'Necesitamos tu consentimiento para poder responderte.'

  return errors
}

/**
 * Formulario de solicitud de auditoría.
 *
 * Comparte backend con el formulario de contacto (`/api/lead`), así que el
 * reto declarado viaja como `mensaje` — que es el campo que valida el
 * servidor. Los campos propios de la auditoría (cargo, tamaño, objetivo) se
 * envían aparte y `api/lead.ts` los imprime en el aviso.
 */
export function AuditForm() {
  const [values, setValues] = useState<Fields>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | EstadoEnvio>('idle')

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)

    if (Object.keys(found).length > 0) {
      const firstKey = Object.keys(found)[0]
      document.getElementById(`pm-audit-${firstKey}`)?.focus()
      return
    }

    const score = leadScore(values)
    const utm = obtenerUtm()

    const payload = {
      nombre: values.nombre,
      empresa: values.empresa,
      email: values.email,
      sector: values.sector,
      cargo: values.cargo,
      tamano: values.tamano,
      objetivo: values.objetivo,
      necesidad: 'Auditoría de IA',
      mensaje: values.reto,
      score,
      ...utm,
    }

    const cuerpo = [
      `Solicitud de auditoría de IA`,
      '',
      `Nombre: ${values.nombre}`,
      `Empresa: ${values.empresa}`,
      `Email: ${values.email}`,
      values.cargo && `Cargo: ${values.cargo}`,
      values.tamano && `Tamaño: ${values.tamano}`,
      values.sector && `Sector: ${values.sector}`,
      `Objetivo: ${values.objetivo}`,
      '',
      values.reto,
    ]
      .filter(Boolean)
      .join('\n')

    setStatus('sending')
    const resultado = await enviarLead({
      payload,
      asunto: `Solicitud de auditoría — ${values.empresa || values.nombre}`,
      cuerpo,
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
        <h3 style={{ fontSize: 'var(--fs-h3)', marginBlock: '1rem 0.75rem' }}>Solicitud recibida</h3>
        <p style={{ color: 'var(--pm-muted)' }}>
          Te escribiremos al email que nos has dejado para concretar la primera conversación. Antes
          de proponerte nada necesitamos entender cómo trabajáis.
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
            id="pm-audit-nombre"
            className="pm-input"
            type="text"
            autoComplete="name"
            value={values.nombre}
            aria-invalid={!!errors.nombre}
            aria-describedby={errors.nombre ? 'pm-audit-nombre-err' : undefined}
            onChange={(e) => set('nombre', e.target.value)}
          />
        </Field>

        <Field id="empresa" label="Empresa" required error={errors.empresa}>
          <input
            id="pm-audit-empresa"
            className="pm-input"
            type="text"
            autoComplete="organization"
            value={values.empresa}
            aria-invalid={!!errors.empresa}
            aria-describedby={errors.empresa ? 'pm-audit-empresa-err' : undefined}
            onChange={(e) => set('empresa', e.target.value)}
          />
        </Field>

        <Field id="email" label="Email" required error={errors.email}>
          <input
            id="pm-audit-email"
            className="pm-input"
            type="email"
            autoComplete="email"
            value={values.email}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'pm-audit-email-err' : undefined}
            onChange={(e) => set('email', e.target.value)}
          />
        </Field>

        <Field id="cargo" label="Tu cargo" error={errors.cargo}>
          <input
            id="pm-audit-cargo"
            className="pm-input"
            type="text"
            autoComplete="organization-title"
            value={values.cargo}
            onChange={(e) => set('cargo', e.target.value)}
          />
        </Field>

        <Field id="tamano" label="Tamaño de la empresa" error={errors.tamano}>
          <select
            id="pm-audit-tamano"
            className="pm-select"
            value={values.tamano}
            onChange={(e) => set('tamano', e.target.value)}
          >
            <option value="">Selecciona…</option>
            {tamanos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field id="sector" label="Sector" error={errors.sector}>
          <select
            id="pm-audit-sector"
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
      </div>

      <div style={{ marginTop: '1.1rem' }}>
        <Field id="objetivo" label="¿Qué te gustaría mejorar con IA?" required error={errors.objetivo}>
          <select
            id="pm-audit-objetivo"
            className="pm-select"
            value={values.objetivo}
            aria-invalid={!!errors.objetivo}
            aria-describedby={errors.objetivo ? 'pm-audit-objetivo-err' : undefined}
            onChange={(e) => set('objetivo', e.target.value)}
          >
            <option value="">Selecciona…</option>
            {objetivos.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div style={{ marginTop: '1.1rem' }}>
        <Field id="reto" label="¿Dónde se atasca tu empresa?" required error={errors.reto}>
          <textarea
            id="pm-audit-reto"
            className="pm-textarea"
            rows={5}
            value={values.reto}
            aria-invalid={!!errors.reto}
            aria-describedby={errors.reto ? 'pm-audit-reto-err' : undefined}
            onChange={(e) => set('reto', e.target.value)}
            placeholder="Qué tarea os come más tiempo, qué se hace a mano, qué se queda sin hacer…"
          />
        </Field>
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <label className="pm-checkbox" htmlFor="pm-audit-consentimiento">
          <input
            id="pm-audit-consentimiento"
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
          <p className="pm-error" style={{ marginTop: '0.5rem' }} id="pm-audit-consentimiento-err">
            <Icon name="alert" size={14} />
            {errors.consentimiento}
          </p>
        )}
      </div>

      {status === 'error' && (
        <p className="pm-error" style={{ marginTop: '1rem' }} role="alert">
          <Icon name="alert" size={14} />
          No hemos podido enviar la solicitud. Escríbenos directamente a {site.email}.
        </p>
      )}

      {status === 'mail' && (
        <p style={{ marginTop: '1rem', color: 'var(--pm-muted)', fontSize: 'var(--fs-small)' }} role="status">
          Hemos abierto tu programa de correo con la solicitud preparada. Si no se ha abierto,
          escríbenos a {site.email}.
        </p>
      )}

      <div style={{ marginTop: '1.75rem' }}>
        <Button type="submit" disabled={status === 'sending'} arrow full>
          {status === 'sending' ? 'Enviando…' : 'Solicitar auditoría de IA'}
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
      <label className="pm-label" htmlFor={`pm-audit-${id}`}>
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
        <p className="pm-error" id={`pm-audit-${id}-err`}>
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
    </div>
  )
}
