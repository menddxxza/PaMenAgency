import { Button } from '@/components/ui/Button'
import { services } from '@/content/services'
import { ServiceCard } from '@/components/sections/ServiceCard'

/**
 * Escena 6 — Servicios. Mismo subconjunto que la Home mostraba con
 * `<ServicesSection limit={6}/>`, mismo `ServiceCard` de siempre — solo
 * cambia el envoltorio (revelado escalonado en vez de `ScrollStack`).
 * `ScrollStack` sigue intacto y en uso en `/servicios`.
 */
export function SceneServices() {
  const shown = services.slice(0, 6)

  return (
    <div className="pm-journey__inner">
      <p className="pm-eyebrow pm-journey__el" style={{ '--i': 0 } as React.CSSProperties}>
        Servicios
      </p>
      <h2 className="pm-journey__title pm-journey__el" style={{ '--i': 1 } as React.CSSProperties}>
        En qué podemos <span className="pm-gold">ayudarte.</span>
      </h2>

      <div className="pm-journey__services pm-stagger">
        {shown.map((service, i) => (
          <div key={service.slug} style={{ '--i': i + 2 } as React.CSSProperties}>
            <ServiceCard service={service} />
          </div>
        ))}
      </div>

      <div className="pm-journey__actions pm-journey__el" style={{ '--i': 8 } as React.CSSProperties}>
        <Button to="/servicios" variant="ghost" arrow>
          Ver los {services.length} servicios
        </Button>
      </div>
    </div>
  )
}
