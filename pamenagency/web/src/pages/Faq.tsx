import { PageHead } from '@/components/ui/PageHead'
import { Section, Reveal } from '@/components/ui/Section'
import { Accordion } from '@/components/ui/Accordion'
import { CtaBand } from '@/components/sections/CtaBand'
import { faqs } from '@/content/faq'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

const orden = ['General', 'Trabajo', 'Técnico', 'Datos', 'Precio'] as const

const titulos: Record<(typeof orden)[number], string> = {
  General: 'Sobre la agencia',
  Trabajo: 'Cómo trabajamos',
  Técnico: 'Herramientas y tecnología',
  Datos: 'Datos y normativa',
  Precio: 'Precio y plazos',
}

export default function Faq() {
  useSeo({
    title: 'Preguntas frecuentes',
    description:
      'Qué hace PaMenAgency, con quién trabaja, qué herramientas usa, qué pasa con tus datos, cuánto cuesta y cuánto tarda una implementación de IA.',
    path: '/faq',
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'FAQ', path: '/faq' },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a.join(' ') },
        })),
      },
    ],
  })

  return (
    <>
      <PageHead
        eyebrow="Preguntas frecuentes"
        title="Lo que suele preguntarse antes de empezar"
        lead="Respuestas directas, incluidas las incómodas. Si falta la tuya, escríbenos y la añadimos."
        breadcrumb={[{ label: 'FAQ' }]}
      />

      <Section container="reading" divided={false}>
        {orden.map((cat, i) => {
          const items = faqs.filter((f) => f.categoria === cat)
          if (!items.length) return null
          return (
            <div key={cat} style={{ marginBottom: 'var(--space-xl)' }}>
              <Reveal delay={i * 60}>
                <h2 className="pm-eyebrow" style={{ marginBottom: '1.25rem' }}>
                  {titulos[cat]}
                </h2>
                <Accordion items={items} allowMultiple />
              </Reveal>
            </div>
          )
        })}
      </Section>

      <CtaBand
        title="¿Te queda alguna duda?"
        text="Pregúntanos directamente. Respondemos aunque la respuesta sea que no podemos ayudarte."
        secondary={null}
      />
    </>
  )
}
