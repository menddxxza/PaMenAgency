import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import {
  areas,
  getAreas,
  getLevel,
  maxScore,
  questions,
} from '@/content/diagnostic'

/**
 * Diagnóstico orientativo.
 *
 * Todo el cálculo ocurre aquí, en el navegador: no se envía nada ni se guarda
 * nada. El resultado señala dónde mirar; deliberadamente no da cifras de
 * ahorro, porque cualquier número sin conocer el caso sería inventado.
 */
export function DiagnosticTool() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [done, setDone] = useState(false)
  // Hallado al probar sólo con teclado, no se ve mirando la pantalla: al
  // avanzar de pregunta (clic en una opción, o "Siguiente"/"Anterior") el
  // foco se quedaba huérfano en <body>, porque el botón enfocado desaparece
  // del DOM en el re-render. Quien navega con teclado o lector de pantalla
  // tenía que volver a tabular desde arriba del todo tras cada respuesta.
  // Este ref mueve el foco al enunciado nuevo, que además lleva aria-live
  // para que se anuncie solo. Se reutiliza en el <h3> de la pregunta y en
  // el <p> del resultado, de ahí el ref-callback: un RefObject normal no
  // es asignable a la vez a un <h3> y a un <p> (TypeScript los trata como
  // tipos de elemento distintos e invariantes).
  const preguntaRef = useRef<HTMLElement | null>(null)
  const setPreguntaRef = (el: HTMLElement | null) => {
    preguntaRef.current = el
  }

  const total = questions.length
  const current = questions[step]
  const answered = answers[current?.id] !== undefined

  const score = questions.reduce((sum, q) => {
    const idx = answers[q.id]
    return idx === undefined ? sum : sum + q.options[idx].score
  }, 0)

  const enfocarPregunta = () => window.requestAnimationFrame(() => preguntaRef.current?.focus())

  const choose = (index: number) => {
    setAnswers((prev) => ({ ...prev, [current.id]: index }))
    // Avance automático, con una pausa mínima para que se vea la selección.
    window.setTimeout(() => {
      if (step < total - 1) setStep((s) => s + 1)
      else setDone(true)
      enfocarPregunta()
    }, 240)
  }

  const ir = (nuevoStep: number) => {
    setStep(nuevoStep)
    enfocarPregunta()
  }

  const restart = () => {
    setAnswers({})
    setStep(0)
    setDone(false)
    enfocarPregunta()
  }

  if (done) {
    const level = getLevel(score)
    const candidatas = getAreas(answers)
    const pct = Math.round((score / maxScore) * 100)

    return (
      <div className="pm-diag">
        <p className="pm-eyebrow" ref={setPreguntaRef} tabIndex={-1} aria-live="polite">
          Resultado orientativo
        </p>

        <div className="pm-score" style={{ marginBlock: '1.75rem' }}>
          <span className="pm-score__value">{level.label}</span>
          <span className="pm-score__label">Potencial</span>
        </div>

        <p style={{ color: 'var(--pm-text-soft)', textAlign: 'center', maxWidth: '58ch', marginInline: 'auto' }}>
          {level.texto}
        </p>

        <p
          className="pm-muted"
          style={{ textAlign: 'center', fontSize: 'var(--fs-small)', marginTop: '0.75rem' }}
        >
          Señales detectadas: {pct} % de las que buscamos.
        </p>

        {candidatas.length > 0 && (
          <div style={{ marginTop: '2.25rem' }}>
            <h3 style={{ fontSize: 'var(--fs-h4)', marginBottom: '1rem' }}>
              Áreas por las que empezaríamos a mirar
            </h3>
            <div className="pm-grid" style={{ gap: '0.75rem' }}>
              {candidatas.map((key) => (
                <div
                  key={key}
                  style={{
                    padding: '1.1rem 1.25rem',
                    border: '1px solid var(--pm-line)',
                    borderRadius: 'var(--radius)',
                    background: 'var(--pm-black)',
                  }}
                >
                  <h4 style={{ fontSize: '1rem', color: 'var(--pm-gold)', marginBottom: '0.4rem' }}>
                    {areas[key].titulo}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--pm-muted)' }}>{areas[key].texto}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--pm-text-soft)', marginTop: '0.65rem' }}>
                    <strong style={{ color: 'var(--pm-text)' }}>Tipo de herramienta: </strong>
                    {areas[key].herramientas}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className="pm-callout"
          style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
        >
          <span style={{ color: 'var(--pm-gold)', flex: 'none', marginTop: '2px' }}>
            <Icon name="alert" size={18} />
          </span>
          <p style={{ fontSize: '0.88rem', color: 'var(--pm-text-soft)' }}>
            Esto es una orientación a partir de diez respuestas, no un análisis. No incluye
            estimaciones de ahorro ni de coste, porque cualquier cifra sin conocer tu caso sería
            inventada. Sirve para saber por dónde empezar a mirar.
          </p>
        </div>

        <div className="pm-diag__nav">
          <Button variant="solid" onClick={restart}>
            Repetir
          </Button>
          <Button to="/contacto" arrow>
            Comentar el resultado
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pm-diag">
      <div className="pm-diag__head">
        <p className="pm-eyebrow">Diagnóstico</p>
        <p className="pm-diag__count">
          {step + 1} / {total}
        </p>
      </div>

      <div className="pm-diag__track" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={total} aria-label="Progreso del diagnóstico">
        <div className="pm-diag__fill" style={{ transform: `scaleX(${(step + 1) / total})` }} />
      </div>

      {/* h2, no h3: en /diagnostico el H1 de la página va seguido directo de
          esta pregunta, sin ningún H2 de por medio — un escaneo automático
          lo marcó como salto de nivel. En la Home sigue siendo un paso
          legal, porque va detrás del H2 de SectionHead. */}
      <h2 className="pm-diag__q" ref={setPreguntaRef} tabIndex={-1} aria-live="polite">
        {current.question}
      </h2>
      {current.help && (
        <p className="pm-muted" style={{ fontSize: 'var(--fs-small)', marginTop: '-1rem', marginBottom: '1.5rem' }}>
          {current.help}
        </p>
      )}

      <div className="pm-diag__options">
        {current.options.map((opt, i) => (
          <button
            key={opt.label}
            type="button"
            className="pm-diag__opt"
            aria-pressed={answers[current.id] === i}
            onClick={() => choose(i)}
          >
            <span className="pm-diag__key" aria-hidden="true">
              {String.fromCharCode(65 + i)}
            </span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="pm-diag__nav">
        <Button variant="solid" size="sm" onClick={() => ir(Math.max(0, step - 1))} disabled={step === 0}>
          Anterior
        </Button>
        {answered && step < total - 1 && (
          <Button size="sm" onClick={() => ir(step + 1)} arrow>
            Siguiente
          </Button>
        )}
        {answered && step === total - 1 && (
          <Button
            size="sm"
            onClick={() => {
              setDone(true)
              enfocarPregunta()
            }}
            arrow
          >
            Ver resultado
          </Button>
        )}
      </div>
    </div>
  )
}
