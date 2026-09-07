import { Icon } from '@/components/ui/Icon'
import { productos } from '@/content/products'

/**
 * Escena 5 — Lo que construimos nosotros mismos. Los 3 productos reales
 * (mismos datos que `ProductsSection.tsx`) como galería de titulares
 * grandes en vez de grid de cards — cada nombre es el propio enlace.
 */
export function SceneProducts() {
  return (
    <div className="pm-journey__inner">
      <p className="pm-eyebrow pm-journey__el" style={{ '--i': 0 } as React.CSSProperties}>
        Lo que construimos nosotros mismos
      </p>
      <h2 className="pm-journey__title pm-journey__el" style={{ '--i': 1 } as React.CSSProperties}>
        No solo lo explicamos. <span className="pm-gold">Lo construimos.</span>
      </h2>

      <ul className="pm-journey__gallery pm-stagger">
        {productos.map((p, i) => (
          <li key={p.slug} style={{ '--i': i + 2 } as React.CSSProperties}>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pm-journey__gallery-link"
              data-cursor-label="Ver proyecto"
            >
              <span className="pm-journey__gallery-icon" aria-hidden="true">
                <Icon name={p.icon} size={20} />
              </span>
              <span className="pm-journey__gallery-name">{p.nombre}</span>
              <span className="pm-journey__gallery-tagline">{p.tagline}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
