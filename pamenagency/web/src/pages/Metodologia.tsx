import { PageHead } from '@/components/ui/PageHead'
import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { MethodologySection } from '@/components/sections/MethodologySection'
import { CtaBand } from '@/components/sections/CtaBand'
import { advantageSteps, pipeline } from '@/content/methodology'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

export default function Metodologia() {
  useSeo({
    title: 'Metodología',
    description:
      'Descubrir, analizar, diseñar, implementar y optimizar. Las cinco fases con las que PaMenAgency aborda cualquier proyecto de IA, con sus entregables.',
    path: '/metodologia',
    jsonLd: breadcrumbJsonLd([
      { name: 'Inicio', path: '/' },
      { name: 'Metodología', path: '/metodologia' },
    ]),
  })

  return (
    <>
      <PageHead
        eyebrow="Metodología"
        title="Cómo trabajamos"
        lead="Cinco fases, siempre en el mismo orden. Cada una produce algo por escrito, y la siguiente no empieza hasta que eso existe."
        breadcrumb={[{ label: 'Metodología' }]}
      />

      <MethodologySection />

      <Section>
        <SectionHead
          eyebrow="El recorrido"
          title="De problema a resultado"
          lead="La misma cadena, aplicada a cualquier caso. La IA es una etapa del recorrido, no el recorrido entero."
        />
        <Reveal>
          <div className="pm-pipeline">
            {pipeline.map((node) => (
              <div className="pm-pipe" key={node.label}>
                <p className="pm-pipe__label">{node.label}</p>
                <p className="pm-pipe__text">{node.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      <Section>
        <SectionHead
          eyebrow="En detalle"
          title="Los nueve pasos"
          lead="Lo que hay dentro de las fases, en el orden en que se recorre."
        />
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
      </Section>

      <CtaBand />
    </>
  )
}
