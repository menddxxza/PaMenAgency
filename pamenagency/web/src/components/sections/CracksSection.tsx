import { Section, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Scene3D } from '@/components/three/Scene3D'
import { cracks } from '@/content/cracks'

export function CracksSection({ limit }: { limit?: number }) {
  const shown = limit ? cracks.slice(0, limit) : cracks

  return (
    <Section id="grietas" className="pm-cracks" divided={false}>
      <div className="pm-split" style={{ marginBottom: 'var(--space-xl)' }}>
        <div>
          <Reveal>
            <p className="pm-eyebrow">Las grietas de la IA</p>
            <h2 className="pm-title" style={{ marginTop: '0.75rem' }}>
              Conocer sus límites es parte de saber utilizarla.
            </h2>
            <p className="pm-lead" style={{ marginTop: '1rem' }}>
              La IA tiene capacidades enormes. También tiene fallos, y casi todos los problemas
              serios vienen de no saber dónde están. Esto no está aquí para asustar a nadie: está
              para que la uses con las manos en el volante.
            </p>
            <div className="pm-row" style={{ marginTop: '1.75rem' }}>
              <Button to="/grietas-de-la-ia" variant="ghost" arrow>
                Ver todas las grietas
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <div className="pm-visual" style={{ border: 'none', background: 'transparent' }}>
            <Scene3D kind="cracks" className="pm-scene--fill" />
          </div>
        </Reveal>
      </div>

      <div className="pm-grid pm-grid--cards">
        {shown.map((crack, i) => (
          <Reveal key={crack.titulo} delay={(i % 3) * 80}>
            <article className="pm-crack-card">
              <h3 className="pm-crack-card__title">
                <span className="pm-crack-card__idx" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {crack.titulo}
              </h3>
              <p className="pm-crack-card__text">{crack.texto}</p>
              <p className="pm-crack-card__fix">
                <strong>Qué hacer: </strong>
                {crack.fix}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
