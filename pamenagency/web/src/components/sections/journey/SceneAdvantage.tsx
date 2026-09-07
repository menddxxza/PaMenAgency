import { Button } from '@/components/ui/Button'
import { pipeline, advantageSteps } from '@/content/methodology'

/**
 * Escena 4 — La IA como ventaja. Es también el momento de "transformación"
 * del mundo compartido (el mundo pasa de red cohesionada a agrietada/dorada
 * mientras esta escena está activa — ver `journeyWorld.ts`, keyframe 3): la
 * escena "IA" que pedía el brief no es contenido nuevo, es este tránsito.
 */
export function SceneAdvantage() {
  const steps = advantageSteps.slice(0, 4)

  return (
    <div className="pm-journey__inner">
      <p className="pm-eyebrow pm-journey__el" style={{ '--i': 0 } as React.CSSProperties}>
        La IA como ventaja
      </p>
      <h2 className="pm-journey__title pm-journey__el" style={{ '--i': 1 } as React.CSSProperties}>
        De herramienta a <span className="pm-gold">ventaja competitiva.</span>
      </h2>

      <div className="pm-journey__pipeline pm-stagger">
        {pipeline.map((node, i) => (
          <div className="pm-journey__pipenode" key={node.label} style={{ '--i': i + 2 } as React.CSSProperties}>
            <span className="pm-journey__pipelabel">{node.label}</span>
          </div>
        ))}
      </div>

      <ul className="pm-journey__steps pm-stagger">
        {steps.map((step, i) => (
          <li key={step.titulo} style={{ '--i': i + 7 } as React.CSSProperties}>
            <span className="pm-journey__stepnum">{String(i + 1).padStart(2, '0')}</span>
            <span>{step.titulo}</span>
          </li>
        ))}
      </ul>

      <div className="pm-journey__actions pm-journey__el" style={{ '--i': 11 } as React.CSSProperties}>
        <Button to="/conocimiento/convertir-la-ia-en-ventaja-real" arrow>
          Leer la guía completa
        </Button>
        <Button to="/diagnostico" variant="ghost">
          Descubrir mi potencial
        </Button>
      </div>
    </div>
  )
}
