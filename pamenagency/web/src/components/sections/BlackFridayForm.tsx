import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { site } from '@/content/site'
import { blackFriday } from '@/content/blackfriday'
import { enviarLead, type EstadoEnvio } from '@/lib/lead'
import { obtenerUtm } from '@/lib/utm'

type Fields = { nombre: string; empresa: string; email: string; telefono: string; sector: string; tarea: string; acepta: boolean }
const empty: Fields = { nombre: '', empresa: '', email: '', telefono: '', sector: '', tarea: '', acepta: false }
type Clave = keyof Fields

const campos: { k: Exclude<Clave, 'acepta' | 'tarea'>; label: string; tipo: string; obligatorio: boolean; auto?: string }[] = [
  { k: 'nombre', label: 'Tu nombre', tipo: 'text', obligatorio: true, auto: 'name' },
  { k: 'empresa', label: 'Empresa o actividad', tipo: 'text', obligatorio: true, auto: 'organization' },
  { k: 'email', label: 'Email', tipo: 'email', obligatorio: true, auto: 'email' },
  { k: 'telefono', label: 'Teléfono (opcional)', tipo: 'tel', obligatorio: false, auto: 'tel' },
  { k: 'sector', label: 'A qué se dedica tu empresa', tipo: 'text', obligatorio: true },
]

/** Formulario de /blackfriday (10 herramientas gratis): quién eres y qué tarea repites cada día. */
export function BlackFridayForm() {
  const [values, setValues] = useState<Fields>(empty)
  const [errors, setErrors] = useState<Partial<Record<Clave, string>>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | EstadoEnvio>('idle')
  const cerrado = Date.now() > new Date(blackFriday.cierre).getTime()

  const set = <K extends Clave>(key: K, value: Fields[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found: Partial<Record<Clave, string>> = {}
    if (values.nombre.trim().length < 2) found.nombre = 'Indica tu nombre.'
    if (values.empresa.trim().length < 2) found.empresa = 'Indica tu empresa o actividad.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) found.email = 'Ese email no parece válido.'
    if (values.sector.trim().length < 2) found.sector = 'Cuéntanos a qué os dedicáis.'
    if (values.tarea.trim().length < 15) found.tarea = 'Cuéntanos la tarea en una o dos frases.'
    if (!values.acepta) found.acepta = 'Tienes que aceptar las bases y la política de privacidad.'
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const primero = Object.keys(found)[0]
      document.getElementById(`pm-bf-${primero}`)?.focus()
      return
    }
    setStatus('sending')
    const cuerpo = [
      '🎁 BLACK FRIDAY 2026 · solicitud de herramienta gratis',
      `Nombre: ${values.nombre}`,
      `Empresa: ${values.empresa}`,
      `Email: ${values.email}`,
      values.telefono && `Teléfono: ${values.telefono}`,
      `Sector: ${values.sector}`,
      '',
      'Tarea que repiten:',
      values.tarea,
    ].filter(Boolean).join('\n')
    const resultado = await enviarLead({
      payload: {
        nombre: values.nombre, empresa: values.empresa, email: values.email, telefono: values.telefono,
        sector: values.sector, necesidad: 'BLACK FRIDAY 2026 · herramienta gratis',
        mensaje: cuerpo, score: 5, ...obtenerUtm(),
      },
      asunto: `Black Friday · ${values.empresa}`,
      cuerpo,
    })
    setStatus(resultado)
    if (resultado === 'sent') setValues(empty)
  }

  if (cerrado) {
    return (
      <div className="pm-diag" style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: 'var(--fs-h3)', marginBottom: '0.75rem' }}>Las solicitudes están cerradas</h3>
        <p style={{ color: 'var(--pm-muted)' }}>
          Gracias a todas las empresas que se han apuntado. Si quieres el diagnóstico gratuito de 30 minutos,{' '}
          <Link to="/diagnostico">pídelo aquí</Link>.
        </p>
      </div>
    )
  }

  if (status === 'sent') {
    return (
      <div className="pm-diag" style={{ textAlign: 'center' }}>
        <span style={{ color: 'var(--pm-gold)', display: 'inline-flex' }}><Icon name="check" size={36} /></span>
        <h3 style={{ fontSize: 'var(--fs-h3)', marginBlock: '1rem 0.75rem' }}>¡Apuntada!</h3>
        <p style={{ color: 'var(--pm-muted)' }}>
          Te escribimos {blackFriday.avisoTexto} para contarte si tu empresa está entre las {blackFriday.plazas} elegidas.
          Aunque no lo esté, tienes el diagnóstico gratuito de 30 minutos.
        </p>
      </div>
    )
  }

  return (
    <form className="pm-diag" onSubmit={onSubmit} noValidate>
      <div className="pm-grid" style={{ gap: '1.1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))' }}>
        {campos.map((c) => (
          <div className="pm-field" key={c.k}>
            <label className="pm-label" htmlFor={`pm-bf-${c.k}`}>
              {c.label}{c.obligatorio && <span className="pm-label__req" aria-hidden="true">*</span>}
            </label>
            <input id={`pm-bf-${c.k}`} className="pm-input" type={c.tipo} autoComplete={c.auto} value={values[c.k]}
              aria-invalid={!!errors[c.k]} aria-describedby={errors[c.k] ? `pm-bf-${c.k}-err` : undefined}
              onChange={(e) => set(c.k, e.target.value)} />
            {errors[c.k] && <p className="pm-error" id={`pm-bf-${c.k}-err`}><Icon name="alert" size={14} />{errors[c.k]}</p>}
          </div>
        ))}
      </div>

      <div className="pm-field" style={{ marginTop: '1.1rem' }}>
        <label className="pm-label" htmlFor="pm-bf-tarea">
          ¿Qué tarea repetís cada día o cada semana?<span className="pm-label__req" aria-hidden="true">*</span>
        </label>
        <textarea id="pm-bf-tarea" className="pm-input" rows={4} value={values.tarea}
          placeholder="Ej.: copiamos a mano los pedidos del correo a una hoja de Excel y luego al programa de facturación."
          aria-invalid={!!errors.tarea} aria-describedby={errors.tarea ? 'pm-bf-tarea-err' : undefined}
          onChange={(e) => set('tarea', e.target.value)} />
        {errors.tarea && <p className="pm-error" id="pm-bf-tarea-err"><Icon name="alert" size={14} />{errors.tarea}</p>}
      </div>

      <label className="pm-row" htmlFor="pm-bf-acepta" style={{ marginTop: '1.1rem', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
        <input id="pm-bf-acepta" type="checkbox" checked={values.acepta} style={{ marginTop: '4px' }}
          aria-invalid={!!errors.acepta} onChange={(e) => set('acepta', e.target.checked)} />
        <span style={{ color: 'var(--pm-text-soft)', fontSize: 'var(--fs-small)' }}>
          He leído las <a href="#bases">bases de la campaña</a> y la <Link to="/legal/privacidad">política de privacidad</Link>.
        </span>
      </label>
      {errors.acepta && <p className="pm-error"><Icon name="alert" size={14} />{errors.acepta}</p>}

      {status === 'error' && (
        <p className="pm-error" style={{ marginTop: '1rem' }} role="alert"><Icon name="alert" size={14} />No hemos podido enviarlo. Escríbenos a {site.email}.</p>
      )}
      {status === 'mail' && (
        <p style={{ marginTop: '1rem', color: 'var(--pm-muted)', fontSize: 'var(--fs-small)' }} role="status">
          Hemos abierto tu programa de correo con todo relleno: solo tienes que enviarlo. Si no se ha abierto, escríbenos a {site.email}.
        </p>
      )}

      <div style={{ marginTop: '1.75rem' }}>
        <Button type="submit" disabled={status === 'sending'} arrow full>
          {status === 'sending' ? 'Enviando…' : 'Quiero mi herramienta gratis'}
        </Button>
      </div>
    </form>
  )
}
