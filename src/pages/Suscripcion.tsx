import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTenant } from '@/context/TenantContext'
import { useSubscription } from '@/hooks/useSubscription'
import { useToast } from '@/context/ToastContext'
import { createCheckoutSession } from '@/lib/billing'
import { PricingTable } from '@/components/billing/PricingTable'
import type { PlanTier } from '@/types/database.types'

export function Suscripcion() {
  const { activeBusinessId, memberships } = useTenant()
  const { subscription, isActive } = useSubscription()
  const { showToast } = useToast()
  const [loadingPlan, setLoadingPlan] = useState<PlanTier | null>(null)

  const myRole = memberships.find((m) => m.businessId === activeBusinessId)?.role

  async function handleSelect(plan: PlanTier) {
    if (!activeBusinessId) return
    if (myRole !== 'owner') {
      showToast('Solo el dueño/a del negocio puede contratar un plan', 'error')
      return
    }
    setLoadingPlan(plan)
    try {
      const url = await createCheckoutSession(activeBusinessId, plan)
      window.location.href = url
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo iniciar el pago', 'error')
      setLoadingPlan(null)
    }
  }

  return (
    <div className="paywall">
      {isActive && (
        <Link to="/app" style={{ alignSelf: 'flex-start', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          ← Volver al panel
        </Link>
      )}
      <h1>{isActive ? 'Tu plan' : 'Activa tu suscripción para usar Atiende'}</h1>
      <p>
        {isActive
          ? 'Puedes cambiar de plan cuando quieras.'
          : 'Elige un plan para empezar a usar el panel — sin suscripción activa, el equipo no puede entrar.'}
      </p>
      {myRole && myRole !== 'owner' && (
        <p className="form-error">Solo el dueño/a del negocio puede contratar o cambiar el plan.</p>
      )}
      <div style={{ marginTop: '1.5rem', width: '100%' }}>
        <PricingTable currentPlan={isActive ? subscription?.plan : undefined} onSelect={handleSelect} loadingPlan={loadingPlan} />
      </div>
    </div>
  )
}
