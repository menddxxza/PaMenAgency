import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/Icon'

/**
 * Por qué trabajar con nosotros. Seis decisiones que condicionan cómo
 * trabajamos — no una lista de adjetivos.
 */
const razones: { icon: IconName; titulo: string; texto: string }[] = [
  {
    icon: 'compass',
    titulo: 'Empezamos por el problema',
    texto:
      'La herramienta se elige al final. Primero hay que saber qué duele, cuánto cuesta y si merece la pena tocarlo.',
  },
  {
    icon: 'gauge',
    titulo: 'Cada solución se justifica',
    texto:
      'Si no sabemos explicar qué tiempo o qué coste recupera algo, no lo proponemos. Y lo que no compensa se descarta por escrito.',
  },
  {
    icon: 'plug',
    titulo: 'Nos conectamos a lo que ya usas',
    texto:
      'No venimos a cambiarte de herramientas. La IA entra donde ya trabajas, no al lado creando una isla más.',
  },
  {
    icon: 'layers',
    titulo: 'Empezamos pequeño y medible',
    texto:
      'Una mejora que funciona y se puede medir genera más cambio que un plan de doce meses que nunca arranca del todo.',
  },
  {
    icon: 'shield',
    titulo: 'Siempre hay una persona',
    texto:
      'Diseñamos dónde interviene alguien y qué pasa cuando el sistema falla. La automatización sin punto de escalado es una avería esperando.',
  },
  {
    icon: 'book',
    titulo: 'Lo entregamos documentado',
    texto:
      'Lo que implantamos queda explicado para que no dependas de nosotros para entenderlo ni para cambiarlo.',
  },
]

export function WhySection() {
  return (
    <Section id="por-que">
      <SectionHead
        eyebrow="Por qué nosotros"
        title="Por qué PaMenAgency"
        lead="Seis criterios que condicionan lo que aceptamos, lo que descartamos y cómo trabajamos."
      />

      <div className="pm-grid pm-grid--cards">
        {razones.map((r, i) => (
          <Reveal key={r.titulo} delay={(i % 3) * 80}>
            <article className="pm-card">
              <span className="pm-card__icon" aria-hidden="true">
                <Icon name={r.icon} size={22} />
              </span>
              <h3 className="pm-card__title">{r.titulo}</h3>
              <p className="pm-card__text">{r.texto}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
