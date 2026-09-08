import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Icon } from '@/components/ui/Icon'
import { areas } from '@/content/areas'

/**
 * Dónde puede actuar la IA dentro de una empresa.
 *
 * Cada área se cuenta con la misma tripleta — problema, qué se hace,
 * qué queda — para que el visitante se reconozca en el problema antes de
 * que le hablemos de ninguna solución.
 */
export function AreasSection() {
  return (
    <Section id="areas">
      <SectionHead
        eyebrow="Dónde actúa"
        title="¿Dónde puede transformar la IA tu empresa?"
        lead="No en todas partes, y no a la vez. Estas son las áreas donde solemos encontrar algo que merece la pena, y lo que cambia en cada una."
      />

      <div className="pm-grid pm-grid--cards">
        {areas.map((area, i) => (
          <Reveal key={area.slug} delay={(i % 3) * 80}>
            <article className="pm-card">
              <span className="pm-card__icon" aria-hidden="true">
                <Icon name={area.icon} size={22} />
              </span>
              <h3 className="pm-card__title">{area.nombre}</h3>

              <p className="pm-flow__label">Hoy</p>
              <p className="pm-card__text">{area.problema}</p>

              <p className="pm-flow__label">Qué hacemos</p>
              <p className="pm-flow__solucion">{area.solucion}</p>

              <p className="pm-card__benefit">
                <Icon name="check" size={15} />
                <span>{area.resultado}</span>
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
