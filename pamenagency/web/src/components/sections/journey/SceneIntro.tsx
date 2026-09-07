import { Button } from '@/components/ui/Button'
import { site } from '@/content/site'

/** Escena 1 — Intro. Mismo contenido que el Hero original, sin su propio canvas: el mundo del viaje vive detrás de las 6 escenas. */
export function SceneIntro() {
  return (
    <div className="pm-journey__inner pm-journey__inner--intro">
      <p className="pm-eyebrow pm-journey__el" style={{ '--i': 0 } as React.CSSProperties}>
        Agencia de Inteligencia Artificial
      </p>

      <h1 className="pm-journey__title pm-journey__title--xl pm-wordmark pm-journey__el" style={{ '--i': 1 } as React.CSSProperties}>
        <span style={{ display: 'block' }}>{site.wordmark.first}</span>
        <span className="pm-wordmark__accent" style={{ display: 'block' }}>
          {site.wordmark.second}
        </span>
      </h1>

      <p className="pm-journey__subtitle pm-journey__el" style={{ '--i': 2 } as React.CSSProperties}>
        Convierte la Inteligencia Artificial en una ventaja real.
      </p>

      <div className="pm-journey__actions pm-journey__el" style={{ '--i': 3 } as React.CSSProperties}>
        <Button to="/nosotros" arrow>
          Descubrir PAMEN AGENCY
        </Button>
        <Button to="/servicios" variant="ghost">
          Ver servicios
        </Button>
      </div>
    </div>
  )
}
