import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { getService } from '@/content/services'

/**
 * Escena 2 — El punto de partida. Mismo contenido que `Problem.tsx` (no se
 * importa de allí para no tocar ese archivo — ver plan de rediseño), aquí
 * como revelado secuencial en vez de acordeón: la escena ya solo muestra 4
 * puntos representativos, no los 8, para que la lectura quepa en un solo
 * scroll de esta escena sin exigir clics.
 */
const problemas = [
  {
    text: 'No saben por dónde empezar, y empezar mal cuesta más que no empezar.',
    fix: 'Por eso existe la consultoría: miramos tu caso concreto antes de proponer nada.',
    service: 'consultoria-de-ia',
  },
  {
    text: 'Usan herramientas de IA sin estrategia, a golpe de novedad.',
    fix: 'La estrategia decide qué merece implementarse y en qué orden, antes de tocar ninguna herramienta.',
    service: 'estrategia-de-ia',
  },
  {
    text: 'Desconocen qué parte de su trabajo es automatizable.',
    fix: 'Analizamos tu día a día y señalamos qué tareas son candidatas reales a automatizar.',
    service: 'automatizacion',
  },
  {
    text: 'Tienen herramientas que no se hablan entre ellas.',
    fix: 'Conectamos lo que ya usas para que la información deje de moverse a mano.',
    service: 'integracion-de-ia',
  },
]

export function SceneProblem() {
  return (
    <div className="pm-journey__inner">
      <p className="pm-eyebrow pm-journey__el" style={{ '--i': 0 } as React.CSSProperties}>
        El punto de partida
      </p>
      <h2 className="pm-journey__title pm-journey__el" style={{ '--i': 1 } as React.CSSProperties}>
        La IA no es el futuro. <span className="pm-gold">Ya está aquí.</span>
      </h2>

      <ul className="pm-journey__list pm-stagger">
        {problemas.map((p, i) => {
          const service = getService(p.service)
          return (
            <li className="pm-journey__problem" key={p.text} style={{ '--i': i + 2 } as React.CSSProperties}>
              <Icon name="alert" size={16} />
              <div>
                <p className="pm-journey__problem-text">{p.text}</p>
                <p className="pm-journey__problem-fix">{p.fix}</p>
                {service && (
                  <Link to={`/servicios/${service.slug}`} className="pm-link">
                    Ver {service.name}
                    <Icon name="arrow" size={13} className="pm-btn__arrow" />
                  </Link>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
