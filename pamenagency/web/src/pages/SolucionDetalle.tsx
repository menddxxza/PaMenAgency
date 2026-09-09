import { Link, Navigate, useParams } from 'react-router-dom'
import { PageHead } from '@/components/ui/PageHead'
import { Section, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { CtaBand } from '@/components/sections/CtaBand'
import { getSolution, solutions } from '@/content/solutions'
import { getService } from '@/content/services'
import { site } from '@/content/site'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

/**
 * Página de una solución. Mismo patrón que `ServicioDetalle`: el
 * componente externo resuelve el slug y el interno —remontado con `key`—
 * es el que puede llamar a `useSeo` sin condicionales.
 */
export default function SolucionDetalle() {
  const { slug } = useParams()
  const solution = getSolution(slug)

  if (!solution) return <Navigate to="/soluciones" replace />
  return <SolucionContenido key={solution.slug} solution={solution} />
}

function SolucionContenido({ solution }: { solution: NonNullable<ReturnType<typeof getSolution>> }) {
  const otras = solutions.filter((s) => s.slug !== solution.slug).slice(0, 3)
  const serviciosRelacionados = solution.servicios
    .map((s) => getService(s))
    .filter((s): s is NonNullable<ReturnType<typeof getService>> => Boolean(s))

  useSeo({
    title: solution.name,
    description: solution.problema.slice(0, 165),
    path: `/soluciones/${solution.slug}`,
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Soluciones', path: '/soluciones' },
        { name: solution.name, path: `/soluciones/${solution.slug}` },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: solution.name,
        alternateName: solution.apellido,
        description: solution.solucion,
        serviceType: 'Inteligencia Artificial aplicada a empresas',
        provider: { '@type': 'Organization', name: site.name, url: site.url },
        areaServed: 'ES',
      },
    ],
  })

  return (
    <>
      <PageHead
        eyebrow={`Solución · ${solution.apellido}`}
        title={solution.name}
        lead={solution.pregunta}
        breadcrumb={[{ label: 'Soluciones', to: '/soluciones' }, { label: solution.name }]}
      >
        <div className="pm-row">
          <Button to="/auditoria-ia" arrow>
            Solicitar auditoría de IA
          </Button>
          <Button to="/contacto" variant="ghost">
            Comentar mi caso
          </Button>
        </div>
      </PageHead>

      <Section divided={false}>
        <div className="pm-split pm-split--textwide">
          <div>
            <Reveal>
              <h2 className="pm-title">El problema</h2>
              <p className="pm-lead" style={{ marginTop: '1rem' }}>
                {solution.problema}
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h2 className="pm-title" style={{ marginTop: 'var(--space-xl)' }}>
                Qué hacemos
              </h2>
              <p style={{ color: 'var(--pm-text-soft)', marginTop: '1rem' }}>{solution.solucion}</p>
            </Reveal>

            <Reveal delay={120}>
              <h2 className="pm-title" style={{ marginTop: 'var(--space-xl)' }}>
                Cómo funciona
              </h2>
              <div className="pm-pipeline" style={{ marginTop: '1.25rem' }}>
                {solution.flujo.map((paso) => (
                  <div className="pm-pipe" key={paso}>
                    <p className="pm-pipe__text">{paso}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={160}>
              <h2 className="pm-title" style={{ marginTop: 'var(--space-xl)' }}>
                Qué incluye
              </h2>
              <ul className="pm-checklist" style={{ marginTop: '1.25rem' }}>
                {solution.incluye.map((item) => (
                  <li key={item}>
                    <Icon name="check" size={17} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div style={{ position: 'sticky', top: 'calc(var(--header-h) + 1.5rem)' }}>
            <Reveal delay={80}>
              <div
                style={{
                  padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                  border: '1px solid var(--pm-line)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--pm-surface)',
                }}
              >
                <p className="pm-eyebrow">Para quién</p>
                <ul className="pm-checklist" style={{ marginTop: '1rem' }}>
                  {solution.paraQuien.map((p) => (
                    <li key={p}>
                      <Icon name="check" size={16} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="pm-callout pm-callout--warn" style={{ marginTop: 'var(--space-md)' }}>
                <p className="pm-callout__label">Cuándo no merece la pena</p>
                <p>{solution.cuandoNo}</p>
              </div>
            </Reveal>

            {serviciosRelacionados.length > 0 && (
              <Reveal delay={160}>
                <div
                  style={{
                    marginTop: 'var(--space-md)',
                    padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                    border: '1px solid var(--pm-gold-line)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--pm-gold-soft)',
                  }}
                >
                  <p className="pm-eyebrow">Con qué servicios se ejecuta</p>
                  <ul style={{ display: 'grid', gap: '0.6rem', marginTop: '1rem' }}>
                    {serviciosRelacionados.map((s) => (
                      <li key={s.slug}>
                        <Link to={`/servicios/${s.slug}`} className="pm-link">
                          {s.name}
                          <span className="pm-muted" style={{ marginLeft: '0.35rem' }}>
                            {s.priceFrom}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </Section>

      <Section>
        <h2 className="pm-title" style={{ marginBottom: 'var(--space-lg)' }}>
          Otras soluciones
        </h2>
        <div className="pm-grid pm-grid--cards">
          {otras.map((s, i) => (
            <Reveal key={s.slug} delay={i * 80}>
              <article className="pm-card pm-card--link">
                <span className="pm-card__icon" aria-hidden="true">
                  <Icon name={s.icon} size={22} />
                </span>
                <h3 className="pm-card__title">
                  <Link to={`/soluciones/${s.slug}`} className="pm-card__cover">
                    {s.name}
                  </Link>
                </h3>
                <p className="pm-card__text">{s.pregunta}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand
        title="¿Aplica esto a tu empresa?"
        text="En la auditoría lo comprobamos con tu caso concreto, y si no aplica te lo decimos."
        primary={{ label: 'Solicitar auditoría de IA', to: '/auditoria-ia' }}
        secondary={{ label: 'Diagnóstico gratuito', to: '/diagnostico' }}
      />
    </>
  )
}
