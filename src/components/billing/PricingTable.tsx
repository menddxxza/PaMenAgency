import { PLANS_LIST } from '@/lib/plans'
import type { PlanTier } from '@/types/database.types'

interface Props {
  currentPlan?: PlanTier
  onSelect?: (plan: PlanTier) => void
  loadingPlan?: PlanTier | null
  ctaLabel?: (plan: PlanTier) => string
}

export function PricingTable({ currentPlan, onSelect, loadingPlan, ctaLabel }: Props) {
  return (
    <div className="pricing-grid">
      {PLANS_LIST.map((plan) => {
        const isCurrent = currentPlan === plan.id
        return (
          <div key={plan.id} className={`pricing-card ${plan.id === 'pro' ? 'pricing-card--featured' : ''}`}>
            {plan.id === 'pro' && <span className="pricing-card__badge">Más elegido</span>}
            <h3>{plan.name}</h3>
            <div className="pricing-card__price">{plan.priceLabel}</div>
            <ul className="pricing-card__features">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            {onSelect && (
              <button
                className={`btn ${plan.id === 'pro' ? 'btn--primary' : ''}`}
                disabled={isCurrent || loadingPlan === plan.id}
                onClick={() => onSelect(plan.id)}
              >
                {isCurrent
                  ? 'Plan actual'
                  : loadingPlan === plan.id
                    ? 'Redirigiendo…'
                    : (ctaLabel?.(plan.id) ?? `Elegir ${plan.name}`)}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
