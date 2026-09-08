import { PageHead } from '@/components/ui/PageHead'
import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { AuditForm } from '@/components/sections/AuditForm'
import { auditSteps, opportunityColumns, auditIncluye, auditNoIncluye } from '@/content/audit'
import { areas } from '@/content/areas'
import { site } from '@/content/site'
import { breadcrumbJsonLd, organizationJsonLd, useSeo } from '@/lib/seo'

/**
 * Auditoría de IA: la puerta de entrada comercial del sitio.
 *
 * El orden importa — primero qué se hace, después qué se entrega, después
 * lo que NO incluye, y sólo entonces el formulario. Alguien que llega aquí
 * está evaluando un servicio de pago: cuanto antes sepa qué recibe y qué
 * no, mejor para las dos partes.
 */
export default function AuditoriaIA() {
  useSeo({
    title: 'Auditoría de IA',
    description:
      'Analizamos tu empresa y te decimos dónde la Inteligencia Artificial puede ahorrar tiempo, generar ingresos o quitarte trabajo repetitivo. Y dónde no merece la pena.',
    path: '/auditoria-ia',
    jsonLd: [
      organizationJsonLd,
      breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Auditoría de IA', path: '/auditoria-ia' },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Auditoría de IA',
        serviceType: 'Consultoría de Inteligencia Artificial',
        description:
          'Análisis de los procesos de una empresa para identificar y priorizar oportunidades de aplicación de Inteligencia Artificial, con estimación de impacto y hoja de ruta.',
        provider: { '@type': 'Organization', name: site.name, url: site.url },
        areaServed: 'ES',
      },
    ],
  })

  return (
    <>
      <PageHead
        eyebrow="Auditoría de IA · AI Business Audit"
        title="Descubre dónde la IA puede crear valor real en tu empresa."
        lead="Analizamos cómo trabajáis hoy y salimos con un mapa de oportunidades priorizadas: qué automatizar, en qué orden, qué impacto tiene con vuestros propios números y qué descartaríamos."
        breadcrumb={[{ label: 'Auditoría de IA' }]}
      >
        <div className="pm-row">
          <Button href="#solicitar" arrow>
            Solicitar auditoría
          </Button>
          <Button to="/diagnostico" variant="ghost">
            Antes, el diagnóstico gratuito
          </Button>
        </div>
      </PageHead>

      <Section divided={false}>
        <SectionHead
          eyebrow="El proceso"
          title="Seis pasos, siempre en el mismo orden."
          lead="Ninguno empieza hasta que el anterior ha dado un resultado por escrito."
        />

        <div className="pm-steps">
          {auditSteps.map((step) => (
            <Reveal as="div" key={step.num} className="pm-step">
              <div className="pm-step__marker">
                <span className="pm-step__num" aria-hidden="true">
                  {step.num}
                </span>
                <span className="pm-step__line" aria-hidden="true" />
              </div>
              <div>
                <h3 className="pm-step__title">
                  {step.titulo} <span className="pm-muted">— {step.resumen}</span>
                </h3>
                <p className="pm-step__text">{step.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHead
          eyebrow="Qué recibes"
          title="El Mapa de Oportunidades de IA"
          lead="El entregable principal. Cada oportunidad detectada se describe siempre con los mismos seis apartados, para que puedas compararlas entre sí y decidir por dónde empezar."
        />

        <div className="pm-grid pm-grid--cards">
          {opportunityColumns.map((col, i) => (
            <Reveal key={col.titulo} delay={(i % 3) * 80}>
              <article className="pm-card">
                <span className="pm-card__icon" aria-hidden="true">
                  <Icon name={col.icon} size={22} />
                </span>
                <h3 className="pm-card__title">{col.titulo}</h3>
                <p className="pm-card__text">{col.texto}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="pm-split pm-split--textwide">
          <div>
            <Reveal>
              <h2 className="pm-title">Qué incluye</h2>
              <ul className="pm-checklist" style={{ marginTop: '1.5rem' }}>
                {auditIncluye.map((item) => (
                  <li key={item}>
                    <Icon name="check" size={17} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={100}>
              <div className="pm-callout pm-callout--warn" style={{ marginTop: 'var(--space-lg)' }}>
                <p className="pm-callout__label">Qué no incluye</p>
                <p>{auditNoIncluye}</p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={80}>
            <div>
              <h2 className="pm-title">Qué áreas se revisan</h2>
              <ul className="pm-checklist" style={{ marginTop: '1.5rem' }}>
                {areas.map((area) => (
                  <li key={area.slug}>
                    <Icon name={area.icon} size={17} />
                    <span>{area.nombre}</span>
                  </li>
                ))}
              </ul>
              <p style={{ color: 'var(--pm-muted)', marginTop: '1.25rem', fontSize: '0.92rem' }}>
                No todas aplican a todas las empresas. En la primera conversación acotamos cuáles
                tienen sentido en tu caso.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section id="solicitar">
        <SectionHead
          eyebrow="Solicitar"
          title="Cuéntanos dónde se atasca tu empresa."
          lead="No hace falta que sepas qué necesitas ni que tengas nada preparado. Con saber qué os come el tiempo es suficiente para empezar."
          align="center"
        />
        <Reveal>
          <div style={{ maxWidth: '780px', marginInline: 'auto' }}>
            <AuditForm />
          </div>
        </Reveal>
      </Section>
    </>
  )
}
