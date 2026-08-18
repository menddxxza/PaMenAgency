import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { docs } from '@/content/knowledge'
import { DocCard } from './DocCard'

export function KnowledgeSection({ limit }: { limit?: number }) {
  const shown = limit ? docs.slice(0, limit) : docs

  return (
    <Section id="conocimiento">
      <SectionHead
        eyebrow="Centro de conocimiento"
        title="Todo lo que sabemos, sin pedirte nada a cambio."
        lead="Guías completas, leídas dentro de la propia web: sin descargas, sin PDF incrustados y sin formulario para acceder. Si con esto resuelves lo tuyo, perfecto."
      />

      <div className="pm-grid pm-grid--cards">
        {shown.map((doc, i) => (
          <Reveal key={doc.slug} delay={(i % 3) * 90}>
            <DocCard doc={doc} />
          </Reveal>
        ))}
      </div>

      {limit && limit < docs.length && (
        <Reveal delay={120}>
          <div className="pm-row" style={{ marginTop: 'var(--space-xl)', justifyContent: 'center' }}>
            <Button to="/conocimiento" variant="ghost" arrow>
              Ver el centro de conocimiento
            </Button>
          </div>
        </Reveal>
      )}
    </Section>
  )
}
