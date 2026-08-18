import { Link, Navigate, useParams } from 'react-router-dom'
import { PageHead } from '@/components/ui/PageHead'
import { Section, Reveal } from '@/components/ui/Section'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { CtaBand } from '@/components/sections/CtaBand'
import { getService, services } from '@/content/services'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'
import { site } from '@/content/site'

export default function ServicioDetalle() {
  const { slug } = useParams()
  const service = getService(slug)

  // Un slug inexistente no muestra un error: vuelve al listado.
  if (!service) return <Navigate to="/servicios" replace />

  return <ServicioContenido key={service.slug} service={service} />
}

function ServicioContenido({ service }: { service: NonNullable<ReturnType<typeof getService>> }) {
  useSeo({
    title: service.name,
    description: service.detail.intro.slice(0, 165),
    path: `/servicios/${service.slug}`,
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Servicios', path: '/servicios' },
        { name: service.name, path: `/servicios/${service.slug}` },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.short,
        serviceType: service.name,
        provider: { '@type': 'Organization', name: site.name, url: site.url },
        areaServed: 'ES',
      },
    ],
  })

  const otros = services.filter((s) => s.slug !== service.slug).slice(0, 3)

  return (
    <>
      <PageHead
        eyebrow="Servicio"
        title={service.name}
        lead={service.short}
        breadcrumb={[{ label: 'Servicios', to: '/servicios' }, { label: service.name }]}
      >
        <div className="pm-row" style={{ marginTop: '1.75rem' }}>
          <Button to="/contacto" arrow>
            Quiero una consultoría
          </Button>
          <Button to="/diagnostico" variant="ghost">
            Descubrir mi potencial
          </Button>
        </div>
      </PageHead>

      <Section divided={false}>
        <div className="pm-split pm-split--textwide" style={{ alignItems: 'start' }}>
          <div>
            <Reveal>
              <p className="pm-lead">{service.detail.intro}</p>
            </Reveal>

            <Reveal delay={80}>
              <h2 className="pm-title" style={{ marginTop: 'var(--space-xl)' }}>
                Qué incluye
              </h2>
              <ul className="pm-checklist" style={{ marginTop: '1.25rem' }}>
                {service.detail.incluye.map((item) => (
                  <li key={item}>
                    <Icon name="check" size={17} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={120}>
              <h2 className="pm-title" style={{ marginTop: 'var(--space-xl)' }}>
                Cómo se desarrolla
              </h2>
              <div className="pm-steps" style={{ marginTop: '1.25rem' }}>
                {service.detail.proceso.map((fase, i) => (
                  <div className="pm-step" key={fase.titulo}>
                    <div className="pm-step__marker" aria-hidden="true">
                      <span className="pm-step__num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="pm-step__line" />
                    </div>
                    <div>
                      <h3 className="pm-step__title" style={{ fontSize: '1.1rem' }}>
                        {fase.titulo}
                      </h3>
                      <p className="pm-step__text">{fase.texto}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div style={{ display: 'grid', gap: '1.25rem', position: 'sticky', top: 'calc(var(--header-h) + 1.5rem)' }}>
            <Reveal delay={60}>
              <div
                style={{
                  padding: '1.35rem 1.5rem',
                  border: '1px solid var(--pm-line)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--pm-surface)',
                }}
              >
                <p className="pm-eyebrow">Para quién</p>
                <ul className="pm-checklist" style={{ marginTop: '1rem' }}>
                  {service.detail.paraQuien.map((p) => (
                    <li key={p} style={{ fontSize: '0.9rem' }}>
                      <Icon name="check" size={15} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={110}>
              <div className="pm-callout pm-callout--warn">
                <p className="pm-callout__label">Cuándo no merece la pena</p>
                <p style={{ fontSize: '0.92rem', color: 'var(--pm-text-soft)' }}>
                  {service.detail.cuandoNo}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section>
        <h2 className="pm-title pm-reveal" style={{ marginBottom: 'var(--space-lg)' }}>
          Otros servicios
        </h2>
        <div className="pm-grid pm-grid--cards">
          {otros.map((s, i) => (
            <Reveal key={s.slug} delay={i * 80}>
              <article className="pm-card pm-card--link">
                <span className="pm-card__icon" aria-hidden="true">
                  <Icon name={s.icon} size={22} />
                </span>
                <h3 className="pm-card__title">
                  <Link className="pm-card__cover" to={`/servicios/${s.slug}`}>
                    {s.name}
                  </Link>
                </h3>
                <p className="pm-card__text">{s.short}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  )
}
