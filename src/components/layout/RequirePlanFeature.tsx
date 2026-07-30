import { Link } from 'react-router-dom'
import { useSubscription } from '@/hooks/useSubscription'
import { PLANS, PLAN_ORDER, type PlanDefinition } from '@/lib/plans'
import { FullPageLoader } from '@/components/layout/FullPageLoader'

type GatedFeature = keyof Pick<
  PlanDefinition,
  'hasClientes' | 'hasEstadisticas' | 'hasFacturacion' | 'hasInventario'
>

interface Props {
  feature: GatedFeature
  children: React.ReactNode
}

const FEATURE_LABEL: Record<GatedFeature, string> = {
  hasClientes: 'Clientes',
  hasEstadisticas: 'Estadísticas',
  hasFacturacion: 'Facturación',
  hasInventario: 'Inventario',
}

// Oculta el link en el menú no alcanza: esto bloquea también la ruta
// directa (/app/clientes, /app/estadisticas) si el plan del negocio no
// incluye esa función.
export function RequirePlanFeature({ feature, children }: Props) {
  const { subscription, loading } = useSubscription()

  if (loading) return <FullPageLoader />

  const plan = PLANS[subscription?.plan ?? 'starter']
  if (!plan[feature]) {
    // Decir qué plan concreto la incluye evita que el cliente tenga que
    // comparar las tres tarjetas para averiguar cuál necesita.
    const requiredPlan = PLAN_ORDER.map((id) => PLANS[id]).find((p) => p[feature])

    return (
      <div className="page">
        <div className="card blank-slate">
          <span className="blank-slate__title">{FEATURE_LABEL[feature]} no está en tu plan {plan.name}</span>
          <p className="blank-slate__desc">
            {requiredPlan
              ? `Esta sección se incluye a partir del plan ${requiredPlan.name} (${requiredPlan.priceLabel}). Puedes cambiar de plan ahora y seguir donde lo dejaste.`
              : 'Cambia de plan para desbloquear esta sección.'}
          </p>
          <Link to="/suscripcion" className="btn btn--primary" style={{ textDecoration: 'none' }}>
            Ver planes
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
