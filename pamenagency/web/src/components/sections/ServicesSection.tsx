import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { services } from '@/content/services'
import { ServiceCard } from './ServiceCard'

export function ServicesSection({ limit }: { limit?: number }) {
  const shown = limit ? services.slice(0, limit) : services

  return (
    <Section id="servicios">
      <SectionHead
        eyebrow="Servicios"
        title="En qué podemos ayudarte."
        lead="Diez formas de trabajar la IA, desde entender qué te conviene hasta dejarlo funcionando. Casi siempre se empieza por una sola."
      />

      <div className="pm-grid pm-grid--cards">
        {shown.map((service, i) => (
          <Reveal key={service.slug} delay={(i % 3) * 90}>
            <ServiceCard service={service} />
          </Reveal>
        ))}
      </div>

      {limit && limit < services.length && (
        <Reveal delay={120}>
          <div className="pm-row" style={{ marginTop: 'var(--space-xl)', justifyContent: 'center' }}>
            <Button to="/servicios" variant="ghost" arrow>
              Ver los {services.length} servicios
            </Button>
          </div>
        </Reveal>
      )}
    </Section>
  )
}
