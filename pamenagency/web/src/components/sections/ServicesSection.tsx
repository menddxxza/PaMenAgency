import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { services } from '@/content/services'
import { ServiceCard } from './ServiceCard'
import ScrollStack, { ScrollStackItem } from '@/components/ui/ScrollStack'

export function ServicesSection({ limit }: { limit?: number }) {
  const shown = limit ? services.slice(0, limit) : services

  return (
    <Section id="servicios">
      <SectionHead
        eyebrow="Servicios"
        title="En qué podemos ayudarte."
        lead="Diez formas de trabajar la IA, desde entender qué te conviene hasta dejarlo funcionando. Casi siempre se empieza por una sola."
      />

      <ScrollStack
        useWindowScroll
        itemDistance={70}
        itemStackDistance={10}
        baseScale={0.9}
        itemScale={0.01}
        blurAmount={4}
        fadeAmount={0.55}
        minOpacity={0.12}
      >
        {shown.map((service) => (
          <ScrollStackItem key={service.slug}>
            <ServiceCard service={service} />
          </ScrollStackItem>
        ))}
      </ScrollStack>

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
