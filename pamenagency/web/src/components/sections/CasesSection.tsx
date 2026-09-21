import { Link } from 'react-router-dom'
import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { casos } from '@/content/cases'

/** Casos de ejemplo por sector. El aviso de que son ilustrativos va en la cabecera y en cada tarjeta. */
export function CasesSection() {
  return (
    <Section id="casos">
      <SectionHead
        eyebrow="Casos de ejemplo"
        title="Así cambia el día a día."
        lead="Casos ilustrativos construidos sobre situaciones que se repiten en cada sector: el problema, lo que se implanta y cómo queda el antes y el después."
      />

      <div className="pm-cases">
        {casos.map((c, i) => (
          <Reveal key={c.sector} delay={(i % 2) * 90}>
            <article className="pm-case">
              <header className="pm-case__head">
                <span className="pm-card__icon" aria-hidden="true">
                  <Icon name={c.icon} size={20} />
                </span>
                <div>
                  <h3 className="pm-case__sector">{c.sector}</h3>
                  <p className="pm-case__tamano">{c.tamano}</p>
                </div>
                <span className="pm-badge">Caso de ejemplo</span>
              </header>

              <p className="pm-case__reto">{c.reto}</p>

              <ul className="pm-case__impl">
                {c.implantado.map((x) => (
                  <li key={x}>
                    <Icon name="check" size={14} />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>

              <div className="pm-case__resultado">
                <div>
                  <span className="pm-case__label">Antes</span>
                  <span className="pm-case__antes">{c.antes}</span>
                </div>
                <Icon name="arrow" size={18} className="pm-case__flecha" />
                <div>
                  <span className="pm-case__label">Después</span>
                  <span className="pm-case__despues">{c.despues}</span>
                </div>
                <span className="pm-case__metrica">{c.metrica}</span>
              </div>

              <Link to={`/sectores/${c.sectorSlug}`} className="pm-link" style={{ marginTop: '1rem' }}>
                Ver el sector
                <Icon name="arrow" size={13} className="pm-btn__arrow" />
              </Link>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <div className="pm-row" style={{ marginTop: 'var(--space-xl)', justifyContent: 'center' }}>
          <Button to="/auditoria-ia" arrow>
            Quiero ver mi caso
          </Button>
          <Button to="/escenarios" variant="ghost">
            Ver escenarios completos
          </Button>
        </div>
      </Reveal>
    </Section>
  )
}
