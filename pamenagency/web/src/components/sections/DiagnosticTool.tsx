import { useState } from 'react'
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

  const total = questions.length
  const current = questions[step]
  const answered = answers[current?.id] !== undefined

  const score = questions.reduce((sum, q) => {
    const idx = answers[q.id]
    return idx === undefined ? sum : sum + q.options[idx].score
  }, 0)

  const choose = (index: number) => {
    setAnswers((prev) => ({ ...prev, [current.id]: index }))
    // Avance automático, con una pausa mínima para que se vea la selección.
    window.setTimeout(() => {
      if (step < total - 1) setStep((s) => s + 1)
      else setDone(true)
    }, 240)
  }

  const restart = () => {
    setAnswers({})
    setStep(0)
    setDone(false)
  }

  if (done) {
    const level = getLevel(score)
    const candidatas = getAreas(answers)
    const pct = Math.round((score / maxScore) * 100)

    return (
      <div className="pm-diag">
        <p className="pm-eyebrow">Resultado orientativo</p>

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

      <h3 className="pm-diag__q">{current.question}</h3>
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
        <Button variant="solid" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Anterior
        </Button>
        {answered && step < total - 1 && (
          <Button size="sm" onClick={() => setStep((s) => s + 1)} arrow>
            Siguiente
          </Button>
        )}
        {answered && step === total - 1 && (
          <Button size="sm" onClick={() => setDone(true)} arrow>
            Ver resultado
          </Button>
        )}
      </div>
    </div>
  )
}
