import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { solutions } from '@/content/solutions'

/**
 * Las soluciones, contadas por el resultado de negocio que persiguen.
 *
 * Las tarjetas todavía no enlazan a ningún sitio: las páginas de detalle
 * (`/soluciones/:slug`) llegan en la siguiente fase, y un enlace a una
 * página que no existe es peor que ninguno. El CTA de la sección lleva
 * donde tiene que llevar todo en esta web: a la auditoría.
 */
export function SolutionsSection() {
  return (
    <Section id="soluciones">
      <SectionHead
        eyebrow="Soluciones"
        title="Siete formas de que la IA deje un resultado."
        lead="No son productos cerrados ni herramientas que revendemos. Son las siete preguntas de negocio que más veces nos encontramos, y lo que hacemos para responder a cada una."
      />

      <div className="pm-grid pm-grid--cards">
        {solutions.map((s, i) => (
          <Reveal key={s.slug} delay={(i % 3) * 80}>
            <article className="pm-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                <span className="pm-card__icon" aria-hidden="true">
                  <Icon name={s.icon} size={22} />
                </span>
                <span className="pm-solution__tag">{s.apellido}</span>
              </div>

              <h3 className="pm-card__title">{s.name}</h3>
              <p className="pm-solution__pregunta">«{s.pregunta}»</p>
              <p className="pm-card__text">{s.solucion}</p>

              <ul className="pm-solution__lista">
                {s.incluye.slice(0, 3).map((item) => (
                  <li key={item}>
                    <Icon name="check" size={14} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <div className="pm-row" style={{ marginTop: 'var(--space-xl)', justifyContent: 'center' }}>
          <Button to="/auditoria-ia" arrow>
            Solicitar auditoría de IA
          </Button>
        </div>
      </Reveal>
    </Section>
  )
}
