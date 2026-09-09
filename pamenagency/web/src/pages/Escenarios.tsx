import { PageHead } from '@/components/ui/PageHead'
import { Section, Reveal } from '@/components/ui/Section'
import { Icon } from '@/components/ui/Icon'
import { CtaBand } from '@/components/sections/CtaBand'
import { scenarios } from '@/content/scenarios'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

/**
 * Escenarios de transformación.
 *
 * El aviso de que son ejercicios y no clientes aparece arriba del todo y
 * se repite en cada escenario. Es la alternativa honesta a inventarse
 * casos de éxito, y sólo funciona si queda clarísimo.
 */
export default function Escenarios() {
  useSeo({
    title: 'Escenarios de transformación',
    description:
      'Tres ejercicios completos de cómo abordaríamos la transformación con IA de un departamento comercial, una administración y un sistema de conocimiento interno. Son escenarios demostrativos, no proyectos realizados.',
    path: '/escenarios',
    jsonLd: breadcrumbJsonLd([
      { name: 'Inicio', path: '/' },
      { name: 'Escenarios', path: '/escenarios' },
    ]),
  })

  return (
    <>
      <PageHead
        eyebrow="Escenarios"
        title="Cómo abordaríamos un proyecto de principio a fin."
        lead="Tres ejercicios completos: la empresa imaginada, el problema, las fases en su orden real, qué cambiaría y qué no tocaríamos."
        breadcrumb={[{ label: 'Escenarios' }]}
      />

      <Section divided={false}>
        <Reveal>
          <div className="pm-callout" style={{ maxWidth: '70ch' }}>
            <p className="pm-callout__label">Antes de seguir</p>
            <p>
              Estos escenarios son ejercicios, no proyectos realizados. No hay ninguna empresa real
              detrás de ninguno y no atribuimos este trabajo a ningún cliente. Están aquí porque
              creemos que ver el método aplicado a un caso completo dice más que una lista de logos
              — y porque inventarse casos de éxito nos parece la peor forma de empezar una relación.
            </p>
          </div>
        </Reveal>

        {scenarios.map((sc, i) => (
          <div key={sc.slug} id={sc.slug} style={{ marginTop: 'var(--space-xl)' }}>
            <Reveal delay={i * 60}>
              <div className="pm-scenario">
                <div className="pm-scenario__head">
                  <span className="pm-card__icon" aria-hidden="true">
                    <Icon name={sc.icon} size={22} />
                  </span>
                  <div>
                    <h2 className="pm-title" style={{ marginTop: 0 }}>
                      {sc.titulo}
                    </h2>
                    <p className="pm-scenario__empresa">
                      <span className="pm-badge">Escenario</span> {sc.empresa}
                    </p>
                  </div>
                </div>

                <p className="pm-lead" style={{ marginTop: 'var(--space-md)' }}>
                  {sc.situacion}
                </p>

                <div className="pm-steps" style={{ marginTop: 'var(--space-lg)' }}>
                  {sc.fases.map((f) => (
                    <div className="pm-step" key={f.titulo}>
                      <div className="pm-step__marker">
                        <span className="pm-step__line" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="pm-step__title">{f.titulo}</h3>
                        <p className="pm-step__text">{f.texto}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pm-split" style={{ marginTop: 'var(--space-lg)', alignItems: 'start' }}>
                  <div>
                    <p className="pm-eyebrow">Qué cambiaría</p>
                    <ul className="pm-checklist" style={{ marginTop: '1rem' }}>
                      {sc.resultado.map((r) => (
                        <li key={r}>
                          <Icon name="check" size={16} />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pm-callout pm-callout--warn">
                    <p className="pm-callout__label">Qué dejaríamos fuera</p>
                    <p>{sc.fuera}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        ))}
      </Section>

      <CtaBand
        title="¿Y el escenario de tu empresa?"
        text="Esto es lo que hace la auditoría: el mismo ejercicio, pero con tus procesos y tus números."
        primary={{ label: 'Solicitar auditoría de IA', to: '/auditoria-ia' }}
        secondary={{ label: 'Diagnóstico gratuito', to: '/diagnostico' }}
      />
    </>
  )
}
