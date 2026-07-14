import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="page" style={{ alignItems: 'center', textAlign: 'center', paddingTop: '4rem' }}>
      <h1 style={{ fontSize: '3rem' }}>404</h1>
      <p>Esta página no existe.</p>
      <Link to="/" className="btn btn--primary" style={{ textDecoration: 'none', width: 'fit-content' }}>
        Volver al dashboard
      </Link>
    </div>
  )
}
