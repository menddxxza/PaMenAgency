import { useState, type FormEvent } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function Signup() {
  const { session, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)

  if (session) {
    return <Navigate to="/app" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    setSubmitting(true)
    setError(null)
    const { error: signUpError } = await signUp(email, password)
    setSubmitting(false)
    if (signUpError) {
      setError(signUpError)
      return
    }
    setConfirmSent(true)
  }

  return (
    <div className="login">
      <form className="login__form" onSubmit={handleSubmit}>
        <h1>Crear cuenta</h1>
        {confirmSent ? (
          <p className="login__hint">
            Te hemos enviado un email para confirmar tu cuenta. Confírmalo y después inicia sesión para crear tu negocio.
          </p>
        ) : (
          <>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </label>
            {error && <p className="login__error">{error}</p>}
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </>
        )}
        <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </form>
    </div>
  )
}
