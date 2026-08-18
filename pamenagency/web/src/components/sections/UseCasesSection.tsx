import { useId, useRef, useState } from 'react'
import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { useCases } from '@/content/useCases'

/**
 * Casos de uso por sector. Sigue el patrón de pestañas de WAI-ARIA: flechas
 * para moverse entre sectores, Inicio/Fin para ir a los extremos.
 */
export function UseCasesSection() {
  const [active, setActive] = useState(0)
  const baseId = useId()
  const tabsRef = useRef<HTMLDivElement>(null)

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = useCases.length - 1
    let next: number | null = null
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = active === last ? 0 : active + 1
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = active === 0 ? last : active - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    if (next === null) return

    e.preventDefault()
    setActive(next)
    tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }

  const current = useCases[active]

  return (
    <Section id="casos-de-uso">
      <SectionHead
        eyebrow="Casos de uso"
        title="¿Qué podemos mejorar?"
        lead="Ejemplos de aplicación por sector: dónde suelen estar las oportunidades y dónde conviene no meter IA. Son ejemplos de lo que es posible, no proyectos realizados."
      />

      <Reveal>
        <div className="pm-usecases">
          <div
            className="pm-usecases__tabs"
            role="tablist"
            aria-label="Sectores"
            aria-orientation="vertical"
            ref={tabsRef}
            onKeyDown={onKeyDown}
          >
            {useCases.map((uc, i) => (
              <button
                key={uc.slug}
                type="button"
                role="tab"
                id={`${baseId}-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`${baseId}-panel-${i}`}
                tabIndex={i === active ? 0 : -1}
                className="pm-usecases__tab"
                onClick={() => setActive(i)}
              >
                <Icon name={uc.icon} size={18} />
                <span>{uc.sector}</span>
              </button>
            ))}
          </div>

          <div
            className="pm-usecases__panel"
            role="tabpanel"
            key={current.slug}
            data-anim="true"
            id={`${baseId}-panel-${active}`}
            aria-labelledby={`${baseId}-tab-${active}`}
            tabIndex={0}
          >
            <h3 style={{ fontSize: 'var(--fs-h3)' }}>{current.sector}</h3>
            <p style={{ color: 'var(--pm-muted)', marginTop: '0.75rem', maxWidth: '68ch' }}>
              {current.situacion}
            </p>

            <div
              className="pm-grid"
              style={{
                marginTop: '1.75rem',
                gap: '0.85rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
              }}
            >
              {current.mejoras.map((m) => (
                <div
                  key={m.titulo}
                  style={{
                    padding: '1rem 1.1rem',
                    border: '1px solid var(--pm-line)',
                    borderRadius: 'var(--radius)',
                    background: 'var(--pm-black)',
                  }}
                >
                  <h4 style={{ fontSize: '0.98rem', marginBottom: '0.35rem' }}>{m.titulo}</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--pm-muted)' }}>{m.texto}</p>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.1rem',
                borderTop: '1px dashed var(--pm-line-strong)',
                display: 'flex',
                gap: '0.7rem',
                alignItems: 'flex-start',
              }}
            >
              <span style={{ color: 'var(--pm-gold)', flex: 'none', marginTop: '3px' }}>
                <Icon name="shield" size={17} />
              </span>
              <p style={{ fontSize: '0.9rem', color: 'var(--pm-text-soft)' }}>
                <strong style={{ color: 'var(--pm-gold)' }}>Dónde no: </strong>
                {current.limite}
              </p>
            </div>

            <div className="pm-row" style={{ marginTop: '1.75rem' }}>
              <Button to="/diagnostico" variant="ghost" size="sm" arrow>
                Ver el potencial de mi caso
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
