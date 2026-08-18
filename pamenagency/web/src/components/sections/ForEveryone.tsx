import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { paths } from '@/content/paths'
import { useSpotlight } from '@/lib/motion'

function PathCard({ path }: { path: (typeof paths)[number] }) {
  const spotlight = useSpotlight()

  return (
    <article className="pm-path" {...spotlight}>
      <h3 className="pm-path__quote">{path.quote}</h3>
      <p className="pm-path__answer">{path.answer}</p>
      <ol className="pm-path__steps">
        {path.steps.map((s, i) => (
          <li key={s}>
            <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
        <Button to={path.cta.to} variant="ghost" size="sm" arrow>
          {path.cta.label}
        </Button>
      </div>
    </article>
  )
}

export function ForEveryone({ limit }: { limit?: number }) {
  const shown = limit ? paths.slice(0, limit) : paths

  return (
    <Section id="ia-para-todos">
      <SectionHead
        eyebrow="IA para todos"
        title="¿No sabes por dónde empezar?"
        lead="No necesitas ser experto en tecnología para aprovechar la IA. Busca la frase que más se parezca a la tuya: cada camino termina en algo que puedes hacer hoy mismo, sin contratar nada."
      />

      <div className="pm-grid pm-grid--cards">
        {shown.map((path, i) => (
          <Reveal key={path.slug} delay={(i % 3) * 90}>
            <PathCard path={path} />
          </Reveal>
        ))}
      </div>

      {limit && limit < paths.length && (
        <Reveal delay={120}>
          <div className="pm-row" style={{ marginTop: 'var(--space-xl)', justifyContent: 'center' }}>
            <Button to="/ia-para-todos" variant="ghost" arrow>
              Ver todos los caminos
            </Button>
          </div>
        </Reveal>
      )}
    </Section>
  )
}
