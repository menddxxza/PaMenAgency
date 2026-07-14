import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function ForgotPassword() {
  const { resetPasswordForEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error: resetError } = await resetPasswordForEmail(email)
    setSubmitting(false)
    if (resetError) {
      setError(resetError)
      return
    }
    setSent(true)
  }

  return (
    <div className="login">
      <form className="login__form" onSubmit={handleSubmit}>
        <h1>Recuperar contraseña</h1>
        {sent ? (
          <p className="login__hint">
            Si existe una cuenta con ese email, te enviamos un enlace para restablecer la contraseña.
          </p>
        ) : (
          <>
            <p className="login__hint">Te enviaremos un enlace a tu email para crear una nueva contraseña.</p>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            {error && <p className="login__error">{error}</p>}
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Enviando…' : 'Enviar enlace'}
            </button>
          </>
        )}
        <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          ← Volver al login
        </Link>
      </form>
    </div>
  )
}
