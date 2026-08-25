import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { methodology } from '@/content/methodology'

export function MethodologySection({ compact = false }: { compact?: boolean }) {
  return (
    <Section id="metodologia">
      <SectionHead
        eyebrow="Metodología"
        title="Cómo trabajamos."
        lead="Cinco fases, siempre en el mismo orden. La tercera no empieza hasta que la segunda ha dado un resultado por escrito."
      />

      <div className="pm-steps">
        {methodology.map((step, i) => (
          <Reveal key={step.num} delay={i * 70} className="pm-step" as="section">
            <div className="pm-step__marker" aria-hidden="true">
              <span className="pm-step__num">{step.num}</span>
              <span className="pm-step__line" />
            </div>
            <div>
              <h3 className="pm-step__title">
                {step.titulo} <span className="pm-muted" style={{ fontWeight: 400 }}>— {step.resumen}</span>
              </h3>
              <p className="pm-step__text">{step.texto}</p>
              {!compact && (
                <div className="pm-step__tags">
                  {step.entregables.map((e) => (
                    <span className="pm-badge" key={e}>
                      {e}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      {compact && (
        <Reveal delay={120}>
          <div className="pm-row" style={{ marginTop: 'var(--space-xl)' }}>
            <Button to="/metodologia" variant="ghost" arrow>
              Ver la metodología completa
            </Button>
          </div>
        </Reveal>
      )}
    </Section>
  )
}
