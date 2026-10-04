import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { miniQuestions, miniMaxScore, getMiniLevel } from '@/content/miniDiagnostic'

/**
 * Mini-diagnóstico de tres preguntas, para páginas contextuales (sectores,
 * guías) donde el diagnóstico completo de diez preguntas pediría demasiado.
 *
 * Accesibilidad, no sólo visual: el cambio de pregunta se anuncia por voz
 * (`aria-live`) y el foco se mueve al enunciado nuevo, porque quien navega
 * con lector de pantalla no ve la pregunta aparecer — necesita que se lo
 * digan y un sitio nuevo donde aterrizar el foco. Sin esto, avanzar de
 * pregunta es invisible para quien no ve la pantalla.
 */
export function MiniDiagnostic({
  eyebrow = 'Comprobación rápida',
  title = '¿Te suena esto?',
  lead = 'Tres preguntas, sin formulario: el resultado sale al momento y sin enviar nada a ningún sitio.',
}: {
  eyebrow?: string
  title?: string
  lead?: string
}) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)
  const preguntaRef = useRef<HTMLHeadingElement>(null)

  const total = miniQuestions.length
  const current = miniQuestions[step]

  const choose = (index: number) => {
    const puntuacion = current.options[index].score
    const nuevas = [...answers, puntuacion]
    setAnswers(nuevas)

    window.setTimeout(() => {
      if (step < total - 1) {
        setStep((s) => s + 1)
        // Mueve el foco al enunciado siguiente para quien navega con teclado
        // o lector de pantalla: sin esto, el foco se queda en un botón que
        // ya no existe en el DOM tras el re-render.
        window.requestAnimationFrame(() => preguntaRef.current?.focus())
      } else {
        setDone(true)
        window.requestAnimationFrame(() => preguntaRef.current?.focus())
      }
    }, 220)
  }

  const restart = () => {
    setAnswers([])
    setStep(0)
    setDone(false)
    window.requestAnimationFrame(() => preguntaRef.current?.focus())
  }

  const score = answers.reduce((s, v) => s + v, 0)

  return (
    <Section id="mini-diagnostico">
      <SectionHead eyebrow={eyebrow} title={title} lead={lead} />
      <Reveal>
        <div className="pm-diag pm-diag--mini">
          {!done ? (
            <>
              <div className="pm-diag__head">
                <p className="pm-diag__count" style={{ marginLeft: 'auto' }}>
                  {step + 1} / {total}
                </p>
              </div>

              <div
                className="pm-diag__track"
                role="progressbar"
                aria-valuenow={step + 1}
                aria-valuemin={1}
                aria-valuemax={total}
                aria-label="Progreso de la comprobación rápida"
              >
                <div className="pm-diag__fill" style={{ transform: `scaleX(${(step + 1) / total})` }} />
              </div>

              {/* aria-live anuncia el cambio de pregunta solo; tabIndex=-1 +
                  el focus() de arriba la convierte además en destino de foco. */}
              <h3 className="pm-diag__q" ref={preguntaRef} tabIndex={-1} aria-live="polite">
                {current.question}
              </h3>

              <div className="pm-diag__options" role="group" aria-label={current.question}>
                {current.options.map((opt, i) => (
                  <button key={opt.label} type="button" className="pm-diag__opt" onClick={() => choose(i)}>
                    <span className="pm-diag__key" aria-hidden="true">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            (() => {
              const nivel = getMiniLevel(score)
              return (
                <>
                  <p className="pm-eyebrow">Resultado</p>
                  <h3
                    className="pm-diag__q"
                    ref={preguntaRef}
                    tabIndex={-1}
                    aria-live="polite"
                    style={{ color: 'var(--pm-gold)' }}
                  >
                    {nivel.label}
                  </h3>
                  <p style={{ color: 'var(--pm-text-soft)', maxWidth: '58ch' }}>{nivel.texto}</p>
                  <p className="pm-muted" style={{ fontSize: 'var(--fs-small)', marginTop: '0.5rem' }}>
                    {Math.round((score / miniMaxScore) * 100)} % de las señales que buscamos, sobre
                    tres preguntas — el diagnóstico completo afina con diez.
                  </p>

                  <div className="pm-diag__nav">
                    <Button variant="solid" size="sm" onClick={restart}>
                      Repetir
                    </Button>
                    <Button to="/diagnostico" size="sm" variant="ghost">
                      Diagnóstico completo
                    </Button>
                    <Button to="/auditoria-ia" size="sm" arrow>
                      Pedir auditoría
                    </Button>
                  </div>
                </>
              )
            })()
          )}
        </div>
      </Reveal>
    </Section>
  )
}
