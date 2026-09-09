import { Link } from 'react-router-dom'
import { PageHead } from '@/components/ui/PageHead'
import { Section, Reveal } from '@/components/ui/Section'
import { Icon } from '@/components/ui/Icon'
import { CtaBand } from '@/components/sections/CtaBand'
import { solutions } from '@/content/solutions'
import { site } from '@/content/site'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

/** Índice de soluciones: las siete preguntas de negocio, cada una a su página. */
export default function Soluciones() {
  useSeo({
    title: 'Soluciones de IA',
    description:
      'Siete formas de que la Inteligencia Artificial deje un resultado en tu empresa: vender más, operar con menos trabajo manual, atender mejor, agentes, conocimiento interno, datos y gobernanza.',
    path: '/soluciones',
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Soluciones', path: '/soluciones' },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: solutions.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: s.name,
          url: `${site.url}/soluciones/${s.slug}`,
        })),
      },
    ],
  })

  return (
    <>
      <PageHead
        eyebrow="Soluciones"
        title="Siete formas de que la IA deje un resultado."
        lead="No son productos cerrados ni herramientas que revendemos. Son las siete preguntas de negocio que más veces nos encontramos, y lo que hacemos para responder a cada una."
        breadcrumb={[{ label: 'Soluciones' }]}
      />

      <Section divided={false}>
        <div className="pm-grid pm-grid--cards">
          {solutions.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 80}>
              <article className="pm-card pm-card--link">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <span className="pm-card__icon" aria-hidden="true">
                    <Icon name={s.icon} size={22} />
                  </span>
                  <span className="pm-solution__tag">{s.apellido}</span>
                </div>

                <h2 className="pm-card__title">
                  <Link to={`/soluciones/${s.slug}`} className="pm-card__cover">
                    {s.name}
                  </Link>
                </h2>
                <p className="pm-solution__pregunta">«{s.pregunta}»</p>
                <p className="pm-card__text">{s.problema}</p>

                <p className="pm-card__benefit">
                  <Icon name="check" size={15} />
                  <span>{s.incluye[0]}</span>
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand
        title="¿Y si miramos tu caso concreto?"
        text="La auditoría es la forma de saber cuál de estas siete te aporta algo de verdad, y en qué orden."
        primary={{ label: 'Solicitar auditoría de IA', to: '/auditoria-ia' }}
        secondary={{ label: 'Diagnóstico gratuito', to: '/diagnostico' }}
      />
    </>
  )
}
