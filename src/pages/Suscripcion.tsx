import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTenant } from '@/context/TenantContext'
import { useSubscription } from '@/hooks/useSubscription'
import { useToast } from '@/context/ToastContext'
import { createCheckoutSession } from '@/lib/billing'
import { usePageTitle } from '@/hooks/usePageTitle'
import { PricingTable } from '@/components/billing/PricingTable'
import type { PlanTier } from '@/types/database.types'

export function Suscripcion() {
  usePageTitle('Suscripción')
  const { activeBusinessId, memberships } = useTenant()
  const { subscription, isActive, isTrialing, trialDaysLeft, trialExpired } = useSubscription()
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

  const { title, subtitle } = (() => {
    if (isTrialing) {
      const daysText =
        trialDaysLeft === null
          ? 'Estás probando el plan Pro completo.'
          : trialDaysLeft < 1
            ? 'Hoy es el último día de tu prueba.'
            : trialDaysLeft === 1
              ? 'Te queda 1 día de prueba.'
              : `Te quedan ${trialDaysLeft} días de prueba.`
      return {
        title: 'Estás probando Atiende gratis',
        subtitle: `${daysText} Al elegir plan, la prueba termina y empieza la suscripción — puedes hacerlo cuando quieras, sin esperar a que se acabe.`,
      }
    }
    if (trialExpired) {
      return {
        title: 'Tu prueba gratuita ha terminado',
        subtitle:
          'Elige un plan para volver a entrar al panel. Todo lo que creaste durante la prueba —citas, clientes, conversaciones— sigue guardado y te espera dentro.',
      }
    }
    if (isActive) {
      return { title: 'Tu plan', subtitle: 'Puedes cambiar de plan cuando quieras.' }
    }
    return {
      title: 'Activa tu suscripción para usar Atiende',
      subtitle: 'Elige un plan para empezar a usar el panel — sin suscripción activa, el equipo no puede entrar.',
    }
  })()

  return (
    <div className="paywall">
      {isActive && (
        <Link to="/app" style={{ alignSelf: 'flex-start', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          ← Volver al panel
        </Link>
      )}
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {myRole && myRole !== 'owner' && (
        <p className="form-error">Solo el dueño/a del negocio puede contratar o cambiar el plan.</p>
      )}
      <div style={{ marginTop: '1.5rem', width: '100%' }}>
        {/* Durante la prueba el plan de la fila es 'pro' pero no está pagado:
            marcarlo como "Plan actual" dejaría el botón deshabilitado justo
            en el plan que más interesa que puedan contratar. */}
        <PricingTable
          currentPlan={isActive && !isTrialing ? subscription?.plan : undefined}
          onSelect={handleSelect}
          loadingPlan={loadingPlan}
        />
      </div>
    </div>
  )
}
