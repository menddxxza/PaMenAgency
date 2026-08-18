import { Button } from '@/components/ui/Button'
import { Scene3D } from '@/components/three/Scene3D'
import { site } from '@/content/site'

/** Divide una frase en palabras animables de forma independiente. */
function Words({ text, base = 0 }: { text: string; base?: number }) {
  const words = text.split(' ')
  return (
    <span className="pm-words">
      {words.map((w, i) => (
        <span key={`${w}-${i}`}>
          <span className="pm-words__w" style={{ '--i': i, '--base': `${base}ms` } as React.CSSProperties}>
            {w}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  )
}

export function Hero() {
  return (
    <section className="pm-hero">
      {/* Fondos decorativos: siempre inertes al puntero y por debajo del texto. */}
      <div className="pm-grid-lines" aria-hidden="true" />
      <div
        className="pm-glow"
        aria-hidden="true"
        style={{
          width: 'min(760px, 110vw)',
          height: 'min(760px, 110vw)',
          right: '-14%',
          top: '4%',
          background: 'rgba(212, 175, 55, 0.10)',
        }}
      />

      {/* La escena ocupa la mitad derecha en escritorio y se centra detrás
          del texto en pantallas estrechas, con menos peso visual. */}
      <div className="pm-hero__canvas" aria-hidden="true">
        <Scene3D kind="core" className="pm-hero__scene" />
      </div>

      <div className="pm-container pm-container--wide pm-above" style={{ width: '100%' }}>
        <div className="pm-hero__content">
          <p className="pm-eyebrow" style={{ marginBottom: '1.5rem' }}>
            Agencia de Inteligencia Artificial
          </p>

          <h1 className="pm-hero__title pm-wordmark">
            <span style={{ display: 'block' }}>{site.wordmark.first}</span>
            <span className="pm-wordmark__accent" style={{ display: 'block' }}>
              {site.wordmark.second}
            </span>
          </h1>

          <p className="pm-hero__subtitle">
            <Words text="Convierte la Inteligencia Artificial en una ventaja real." base={260} />
          </p>

          <p className="pm-hero__text">
            Te ayudamos a entender, implementar y aprovechar la IA para trabajar mejor, automatizar
            procesos y descubrir oportunidades que antes parecían imposibles.
          </p>

          <div className="pm-hero__actions">
            <Button to="/nosotros" arrow>
              Descubrir PA MEN AGENCY
            </Button>
            <Button to="/servicios" variant="ghost">
              Ver servicios
            </Button>
          </div>
        </div>
      </div>

      <a className="pm-scrollcue" href="#el-problema" aria-label="Ir al contenido">
        <span>Scroll</span>
        <span className="pm-scrollcue__track" aria-hidden="true" />
      </a>
    </section>
  )
}
