import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSubscription } from '@/hooks/useSubscription'
import { useToast } from '@/context/ToastContext'
import { createPortalSession } from '@/lib/billing'
import { PLANS } from '@/lib/plans'

const STATUS_LABEL: Record<string, string> = {
  active: 'Activa',
  trialing: 'En prueba',
  past_due: 'Pago pendiente',
  canceled: 'Cancelada',
  incomplete: 'Sin activar',
}

export function BillingSection({ businessId }: { businessId: string }) {
  const { subscription, isActive, isTrialing, trialDaysLeft, loading } = useSubscription()
  const { showToast } = useToast()
  const [openingPortal, setOpeningPortal] = useState(false)

  async function handleManage() {
    setOpeningPortal(true)
    try {
      const url = await createPortalSession(businessId)
      window.location.href = url
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo abrir la facturación', 'error')
      setOpeningPortal(false)
    }
  }

  if (loading) return null

  const plan = PLANS[subscription?.plan ?? 'starter']

  return (
    <div className="card">
      <h2 className="card__title">Facturación</h2>
      <div className="mini-list">
        <div className="mini-list__item">
          <span>Plan actual</span>
          <span>
            {/* Durante la prueba no se está pagando nada: enseñar el precio
                del plan al lado de "Plan actual" haría pensar que ya se está
                cobrando. */}
            <strong>{plan.name}</strong> · {isTrialing ? 'gratis durante la prueba' : plan.priceLabel}
          </span>
        </div>
        <div className="mini-list__item">
          <span>Estado</span>
          <span className={`badge ${isActive ? 'badge--confirmed' : 'badge--cancelled'}`}>
            {STATUS_LABEL[subscription?.status ?? 'incomplete']}
          </span>
        </div>
        {isTrialing && trialDaysLeft !== null && (
          <div className="mini-list__item">
            <span>Prueba</span>
            <span>{trialDaysLeft < 1 ? 'Termina hoy' : `Quedan ${trialDaysLeft} día${trialDaysLeft === 1 ? '' : 's'}`}</span>
          </div>
        )}
      </div>
      <div className="modal__footer" style={{ justifyContent: 'flex-start', marginTop: '1rem' }}>
        {isActive && subscription?.stripe_customer_id && (
          <button className="btn btn--primary" onClick={handleManage} disabled={openingPortal}>
            {openingPortal ? 'Abriendo…' : 'Gestionar facturación'}
          </button>
        )}
        <Link
          to="/suscripcion"
          className={`btn ${isTrialing ? 'btn--primary' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          {isTrialing ? 'Elegir plan' : isActive ? 'Cambiar de plan' : 'Ver planes'}
        </Link>
      </div>
    </div>
  )
}
