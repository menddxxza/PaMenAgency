import { useState, type FormEvent } from 'react'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'
import { createBusiness } from '@/lib/mutations'

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function OnboardingBusiness() {
  const { refresh } = useTenant()
  const { signOut } = useAuth()
  const [name, setName] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await createBusiness(name, slugify(name), whatsappNumber || undefined)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el negocio')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="onboarding">
      <form className="login__form" onSubmit={handleSubmit}>
        <h1>Crea tu negocio</h1>
        <p className="login__hint">Todavía no tienes ningún negocio vinculado a tu cuenta.</p>
        <label>
          Nombre del negocio
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="All Nails" />
        </label>
        <label>
          Número de WhatsApp (opcional)
          <input
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="+34 600 000 000"
          />
        </label>
        {error && <p className="login__error">{error}</p>}
        <button type="submit" className="btn btn--primary" disabled={submitting || !name}>
          {submitting ? 'Creando…' : 'Crear negocio'}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => signOut()}>
          Cerrar sesión
        </button>
      </form>
    </div>
  )
}
