import { PageHead } from '@/components/ui/PageHead'
import { Section, Reveal } from '@/components/ui/Section'
import { ServiceCard } from '@/components/sections/ServiceCard'
import { CtaBand } from '@/components/sections/CtaBand'
import { MethodologySection } from '@/components/sections/MethodologySection'
import { services } from '@/content/services'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'
import { site } from '@/content/site'

export default function Servicios() {
  useSeo({
    title: 'Servicios',
    description:
      'Consultoría de IA, automatización, integración, asistentes, formación y estrategia. Servicios de inteligencia artificial para personas, PYMEs y empresas.',
    path: '/servicios',
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Servicios', path: '/servicios' },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Servicios de PaMenAgency',
        itemListElement: services.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: s.name,
          description: s.short,
          url: `${site.url}/servicios/${s.slug}`,
        })),
      },
    ],
  })

  return (
    <>
      <PageHead
        eyebrow="Servicios"
        title="En qué podemos ayudarte"
        lead="Diez formas de trabajar la Inteligencia Artificial, desde entender qué te conviene hasta dejarlo funcionando y documentado. Casi nadie necesita las diez: se empieza por una."
        breadcrumb={[{ label: 'Servicios' }]}
      />

      <Section divided={false}>
        <div className="pm-grid pm-grid--cards">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={(i % 3) * 80}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </Section>

      <MethodologySection compact />
      <CtaBand
        title="¿No sabes cuál te toca?"
        text="Es lo más habitual. Cuéntanos tu situación y te decimos por dónde empezaríamos nosotros."
      />
    </>
  )
}
