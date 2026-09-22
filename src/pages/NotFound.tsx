import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { usePageTitle } from '@/hooks/usePageTitle'

export function NotFound() {
  usePageTitle('Página no encontrada')
  const { session } = useAuth()

  return (
    <div className="page" style={{ alignItems: 'center', textAlign: 'center', paddingTop: '4rem' }}>
      <h1 style={{ fontSize: '3rem' }}>404</h1>
      <p>Esta página no existe o ha cambiado de dirección.</p>
      {/* El botón decía "Volver al dashboard" pero llevaba a la landing.
          Ahora lleva a donde dice, según haya sesión iniciada o no. */}
      <Link
        to={session ? '/app' : '/'}
        className="btn btn--primary"
        style={{ textDecoration: 'none', width: 'fit-content', marginTop: '0.75rem' }}
      >
        {session ? 'Volver al panel' : 'Ir al inicio'}
      </Link>
    </div>
  )
}
