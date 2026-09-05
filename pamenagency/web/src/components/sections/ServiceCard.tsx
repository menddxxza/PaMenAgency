import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useSpotlight } from '@/lib/motion'
import type { Service } from '@/content/services'

export function ServiceCard({ service }: { service: Service }) {
  const spotlight = useSpotlight()

  return (
    <article className="pm-card pm-card--link" {...spotlight}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <span className="pm-card__icon" aria-hidden="true">
          <Icon name={service.icon} size={22} />
        </span>
        <span className="pm-badge pm-badge--gold" style={{ flex: 'none' }}>
          {service.priceFrom}
        </span>
      </div>

      <h3 className="pm-card__title">
        {/* El enlace cubre toda la tarjeta, pero sigue siendo un enlace real:
            navegable con teclado y abrible en una pestaña nueva. */}
        <Link to={`/servicios/${service.slug}`} className="pm-card__cover">
          {service.name}
        </Link>
      </h3>

      <p className="pm-card__text">{service.short}</p>

      <p className="pm-card__benefit">
        <Icon name="check" size={15} />
        <span>{service.benefit}</span>
      </p>
    </article>
  )
}
