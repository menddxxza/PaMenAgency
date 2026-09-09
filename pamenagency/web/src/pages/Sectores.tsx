import { Link } from 'react-router-dom'
import { PageHead } from '@/components/ui/PageHead'
import { Section, Reveal } from '@/components/ui/Section'
import { Icon } from '@/components/ui/Icon'
import { CtaBand } from '@/components/sections/CtaBand'
import { useCases } from '@/content/useCases'
import { site } from '@/content/site'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

/** Índice de sectores. Los datos son los mismos que la home ya usaba en pestañas. */
export default function Sectores() {
  useSeo({
    title: 'IA por sector',
    description:
      'Cómo se aplica la Inteligencia Artificial en cada sector: hostelería, clínicas, comercio, autónomos, agencias, inmobiliarias, servicios, educación y más. Ejemplos de aplicación, no casos de clientes.',
    path: '/sectores',
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Sectores', path: '/sectores' },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: useCases.map((u, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: u.sector,
          url: `${site.url}/sectores/${u.slug}`,
        })),
      },
    ],
  })

  return (
    <>
      <PageHead
        eyebrow="Sectores"
        title="La IA no se aplica igual en todos los negocios."
        lead="Lo que ahorra tiempo en una clínica no es lo mismo que lo que lo ahorra en un taller. Estos son los puntos donde solemos encontrar algo aprovechable en cada sector."
        breadcrumb={[{ label: 'Sectores' }]}
      />

      <Section divided={false}>
        <div className="pm-grid pm-grid--cards">
          {useCases.map((u, i) => (
            <Reveal key={u.slug} delay={(i % 3) * 80}>
              <article className="pm-card pm-card--link">
                <span className="pm-card__icon" aria-hidden="true">
                  <Icon name={u.icon} size={22} />
                </span>
                <h2 className="pm-card__title">
                  <Link to={`/sectores/${u.slug}`} className="pm-card__cover">
                    {u.sector}
                  </Link>
                </h2>
                <p className="pm-card__text">{u.situacion}</p>
                <p className="pm-card__benefit">
                  <Icon name="check" size={15} />
                  <span>{u.mejoras.length} puntos de mejora habituales</span>
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p style={{ color: 'var(--pm-muted)', marginTop: 'var(--space-lg)', fontSize: '0.92rem', maxWidth: '62ch' }}>
            Son ejemplos de aplicación, no proyectos realizados: no atribuimos ningún trabajo a
            ninguna empresa concreta. Si tu sector no está aquí, el método es el mismo.
          </p>
        </Reveal>
      </Section>

      <CtaBand
        title="¿Y en tu caso concreto?"
        text="Un sector es una generalización. La auditoría mira tu empresa, no tu categoría."
        primary={{ label: 'Solicitar auditoría de IA', to: '/auditoria-ia' }}
        secondary={{ label: 'Diagnóstico gratuito', to: '/diagnostico' }}
      />
    </>
  )
}
