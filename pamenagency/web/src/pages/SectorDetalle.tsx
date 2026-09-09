import { Link, Navigate, useParams } from 'react-router-dom'
import { PageHead } from '@/components/ui/PageHead'
import { Section, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { CtaBand } from '@/components/sections/CtaBand'
import { getUseCase, useCases } from '@/content/useCases'
import { site } from '@/content/site'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

export default function SectorDetalle() {
  const { slug } = useParams()
  const caso = slug ? getUseCase(slug) : undefined

  if (!caso) return <Navigate to="/sectores" replace />
  return <SectorContenido key={caso.slug} caso={caso} />
}

function SectorContenido({ caso }: { caso: NonNullable<ReturnType<typeof getUseCase>> }) {
  const otros = useCases.filter((u) => u.slug !== caso.slug).slice(0, 3)

  useSeo({
    title: `IA para ${caso.sector.toLowerCase()}`,
    description: caso.situacion.slice(0, 165),
    path: `/sectores/${caso.slug}`,
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Sectores', path: '/sectores' },
        { name: caso.sector, path: `/sectores/${caso.slug}` },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: `Inteligencia Artificial para ${caso.sector}`,
        description: caso.situacion,
        provider: { '@type': 'Organization', name: site.name, url: site.url },
        areaServed: 'ES',
      },
    ],
  })

  return (
    <>
      <PageHead
        eyebrow="Sector"
        title={`IA para ${caso.sector.toLowerCase()}`}
        lead={caso.situacion}
        breadcrumb={[{ label: 'Sectores', to: '/sectores' }, { label: caso.sector }]}
      >
        <div className="pm-row">
          <Button to="/auditoria-ia" arrow>
            Solicitar auditoría de IA
          </Button>
          <Button to="/diagnostico" variant="ghost">
            Diagnóstico gratuito
          </Button>
        </div>
      </PageHead>

      <Section divided={false}>
        <div className="pm-split pm-split--textwide">
          <div>
            <Reveal>
              <h2 className="pm-title">Dónde suele haber margen</h2>
              <p style={{ color: 'var(--pm-muted)', marginTop: '0.75rem', fontSize: '0.95rem' }}>
                Ejemplos de aplicación habituales en el sector — no proyectos realizados para
                ninguna empresa concreta.
              </p>
            </Reveal>

            <div className="pm-steps" style={{ marginTop: 'var(--space-lg)' }}>
              {caso.mejoras.map((m, i) => (
                <Reveal as="div" key={m.titulo} className="pm-step" delay={i * 70}>
                  <div className="pm-step__marker">
                    <span className="pm-step__num" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="pm-step__line" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="pm-step__title">{m.titulo}</h3>
                    <p className="pm-step__text">{m.texto}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div style={{ position: 'sticky', top: 'calc(var(--header-h) + 1.5rem)' }}>
            <Reveal delay={80}>
              <div className="pm-callout pm-callout--warn">
                <p className="pm-callout__label">Dónde no conviene</p>
                <p>{caso.limite}</p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div
                style={{
                  marginTop: 'var(--space-md)',
                  padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                  border: '1px solid var(--pm-line)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--pm-surface)',
                }}
              >
                <p className="pm-eyebrow">Siguiente paso</p>
                <p style={{ color: 'var(--pm-text-soft)', marginTop: '1rem', fontSize: '0.95rem' }}>
                  Un sector es una generalización útil para orientarse, pero no dice qué te conviene
                  a ti. Eso sale de mirar tus procesos concretos.
                </p>
                <div className="pm-row" style={{ marginTop: '1.25rem' }}>
                  <Button to="/auditoria-ia" size="sm" arrow>
                    Ver la auditoría
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section>
        <h2 className="pm-title" style={{ marginBottom: 'var(--space-lg)' }}>
          Otros sectores
        </h2>
        <div className="pm-grid pm-grid--cards">
          {otros.map((u, i) => (
            <Reveal key={u.slug} delay={i * 80}>
              <article className="pm-card pm-card--link">
                <span className="pm-card__icon" aria-hidden="true">
                  <Icon name={u.icon} size={22} />
                </span>
                <h3 className="pm-card__title">
                  <Link to={`/sectores/${u.slug}`} className="pm-card__cover">
                    {u.sector}
                  </Link>
                </h3>
                <p className="pm-card__text">{u.situacion}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand
        primary={{ label: 'Solicitar auditoría de IA', to: '/auditoria-ia' }}
        secondary={{ label: 'Diagnóstico gratuito', to: '/diagnostico' }}
      />
    </>
  )
}
