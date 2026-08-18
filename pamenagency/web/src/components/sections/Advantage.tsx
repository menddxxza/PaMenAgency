import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { advantageSteps, pipeline } from '@/content/methodology'

export function Advantage() {
  return (
    <Section id="ventaja">
      <SectionHead
        eyebrow="La IA como ventaja"
        title="De herramienta a ventaja competitiva."
        lead="Una herramienta que tiene todo el mundo no es una ventaja. La ventaja aparece cuando existe un recorrido: del problema al resultado, con criterio en cada paso."
      />

      <Reveal>
        <div className="pm-pipeline" style={{ marginBottom: 'var(--space-xl)' }}>
          {pipeline.map((node, i) => (
            <div
              className="pm-pipe pm-reveal"
              key={node.label}
              style={{ '--reveal-delay': `${i * 90}ms` } as React.CSSProperties}
            >
              <p className="pm-pipe__label">{node.label}</p>
              <p className="pm-pipe__text">{node.text}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="pm-grid pm-grid--cards">
        {advantageSteps.map((step, i) => (
          <Reveal key={step.titulo} delay={(i % 3) * 80}>
            <article
              style={{
                display: 'grid',
                gap: '0.4rem',
                padding: '1.15rem 1.25rem',
                borderLeft: '1px solid var(--pm-line-strong)',
                height: '100%',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.16em',
                  color: 'var(--pm-gold)',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 style={{ fontSize: '1.05rem' }}>{step.titulo}</h3>
              <p style={{ color: 'var(--pm-muted)', fontSize: '0.92rem' }}>{step.texto}</p>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <div className="pm-row" style={{ marginTop: 'var(--space-xl)' }}>
          <Button to="/conocimiento/convertir-la-ia-en-ventaja-real" arrow>
            Leer la guía completa
          </Button>
          <Button to="/diagnostico" variant="ghost">
            Descubrir mi potencial
          </Button>
        </div>
      </Reveal>
    </Section>
  )
}
