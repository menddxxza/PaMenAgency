import { Link } from 'react-router-dom'
import { useSubscription } from '@/hooks/useSubscription'
import { PLANS, type PlanDefinition } from '@/lib/plans'

interface Props {
  feature: keyof Pick<PlanDefinition, 'hasClientes' | 'hasEstadisticas' | 'hasFacturacion'>
  children: React.ReactNode
}

// Oculta el link en el menú no alcanza: esto bloquea también la ruta
// directa (/app/clientes, /app/estadisticas) si el plan del negocio no
// incluye esa función.
export function RequirePlanFeature({ feature, children }: Props) {
  const { subscription, loading } = useSubscription()

  if (loading) return <div className="page">Cargando…</div>

  const plan = PLANS[subscription?.plan ?? 'starter']
  if (!plan[feature]) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center' }}>
          <h2 className="card__title">Esta función no está en tu plan</h2>
          <p style={{ marginBottom: '1rem' }}>Subí de plan para desbloquearla.</p>
          <Link to="/suscripcion" className="btn btn--primary" style={{ textDecoration: 'none', width: 'fit-content', margin: '0 auto' }}>
            Ver planes
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
