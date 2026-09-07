import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

/**
 * Escena 3 — Quiénes somos. Mismo contenido que `About.tsx` (no se importa
 * de allí para no tocarlo — ver plan), condensado para caber en un único
 * viewport fijo sin scroll propio.
 */
const principios = [
  'Si la IA no aporta algo en tu caso, lo decimos. Es más barato para todos.',
  'Empezamos por lo pequeño que funciona, no por lo grande que impresiona.',
  'Lo que implantamos queda documentado: no dependes de nosotros para entenderlo.',
]

export function SceneAbout() {
  return (
    <div className="pm-journey__inner">
      <p className="pm-eyebrow pm-journey__el" style={{ '--i': 0 } as React.CSSProperties}>
        Quiénes somos
      </p>
      <h2 className="pm-journey__title pm-journey__el" style={{ '--i': 1 } as React.CSSProperties}>
        La IA no debe sustituir tu capacidad. <span className="pm-gold">Debe multiplicarla.</span>
      </h2>
      <p className="pm-journey__lead pm-journey__el" style={{ '--i': 2 } as React.CSSProperties}>
        Existimos para cerrar la distancia entre lo que la IA puede hacer y lo que la gente hace
        realmente con ella. No vendiendo la herramienta de moda, sino enseñando a mirar.
      </p>

      <ul className="pm-journey__checklist pm-stagger">
        {principios.map((p, i) => (
          <li key={p} style={{ '--i': i + 3 } as React.CSSProperties}>
            <Icon name="check" size={16} />
            <span>{p}</span>
          </li>
        ))}
      </ul>

      <div className="pm-journey__actions pm-journey__el" style={{ '--i': 6 } as React.CSSProperties}>
        <Button to="/nosotros" variant="ghost" arrow>
          Conocer la agencia
        </Button>
        <Button to="/metodologia" variant="solid">
          Ver metodología
        </Button>
      </div>
    </div>
  )
}
