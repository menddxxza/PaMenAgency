import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Accordion } from '@/components/ui/Accordion'
import { faqs } from '@/content/faq'

export function FaqSection({ limit }: { limit?: number }) {
  const shown = limit ? faqs.slice(0, limit) : faqs

  return (
    <Section id="faq" container="reading">
      <SectionHead
        eyebrow="Preguntas frecuentes"
        title="Lo que suele preguntarse antes de empezar."
        lead="Respuestas directas. Si falta la tuya, escríbenos y la añadimos."
      />

      <Reveal>
        <Accordion items={shown} />
      </Reveal>

      {limit && limit < faqs.length && (
        <Reveal delay={100}>
          <div className="pm-row" style={{ marginTop: 'var(--space-lg)', justifyContent: 'center' }}>
            <Button to="/faq" variant="ghost" arrow>
              Ver las {faqs.length} preguntas
            </Button>
          </div>
        </Reveal>
      )}
    </Section>
  )
}
