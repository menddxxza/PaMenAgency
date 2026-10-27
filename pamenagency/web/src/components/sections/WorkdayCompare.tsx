import { useEffect, useRef, useState } from 'react'
import { FACTOR, FIN_MIN, INICIO_MIN, tareas } from '@/content/workday'
import { usePrefersReducedMotion } from '@/lib/motion'

/** Duración de la jornada simulada y pausa al terminar, en ms. */
const DURACION = 11000
const PAUSA = 2600

const total = tareas.length

/**
 * Una jornada simulada: el reloj avanza de 9:00 a 17:00 y las dos columnas
 * procesan las mismas tareas, la de IA `FACTOR` veces más rápido.
 *
 * Sólo corre mientras está en pantalla (IntersectionObserver) y respeta
 * `prefers-reduced-motion`: en ese caso muestra directamente el final de
 * la jornada, que es donde se ve la comparación.
 */
export function WorkdayCompare() {
  const reduced = usePrefersReducedMotion()
  const [p, setP] = useState(reduced ? 1 : 0)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) {
      setP(1)
      return
    }
    const el = rootRef.current
    if (!el) return

    let frame = 0
    let inicio = 0
    let visible = false
    let ultimo = 0

    const tick = (t: number) => {
      frame = requestAnimationFrame(tick)
      if (!visible) return
      if (!inicio) inicio = t
      // ~30 fps es de sobra para un reloj y unas barras.
      if (t - ultimo < 33) return
      ultimo = t
      const ciclo = (t - inicio) % (DURACION + PAUSA)
      setP(Math.min(ciclo / DURACION, 1))
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (!visible) inicio = 0
    })
    io.observe(el)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
    }
  }, [reduced])

  const minutos = INICIO_MIN + p * (FIN_MIN - INICIO_MIN)
  const hh = String(Math.floor(minutos / 60)).padStart(2, '0')
  const mm = String(Math.floor(minutos % 60)).padStart(2, '0')

  // La IA termina las seis justo al final; a mano va `FACTOR` veces más lenta.
  const hechasIa = p * total
  const hechasMano = (p * total) / FACTOR

  return (
    <div className="pm-workday" ref={rootRef}>
      <Reloj minutos={minutos} p={p} />
      <p className="pm-workday__hora" aria-live="off">
        {hh}:{mm}
      </p>
      <p className="pm-workday__label">Jornada</p>

      <Columna titulo="A mano" hechas={hechasMano} />
      <Columna titulo="Con IA" hechas={hechasIa} ia />
    </div>
  )
}

function Columna({ titulo, hechas, ia = false }: { titulo: string; hechas: number; ia?: boolean }) {
  const completas = Math.min(Math.floor(hechas + 1e-6), total)
  const terminado = completas >= total
  const actual = terminado ? 'Todo listo' : tareas[completas]

  return (
    <div className={`pm-workday__col${ia ? ' pm-workday__col--ia' : ''}`}>
      <div className="pm-workday__colhead">
        <span className="pm-workday__coltitle">{titulo}</span>
        <span className="pm-workday__quedan">
          {terminado ? 'Terminado' : `Quedan ${total - completas}`}
        </span>
      </div>
      <div className="pm-workday__task">
        <span className="pm-workday__spinner" data-done={terminado} aria-hidden="true" />
        <span className="pm-workday__taskname">{actual}</span>
        <span className="pm-workday__count">
          {completas}/{total}
        </span>
      </div>
      <div className="pm-workday__bar" aria-hidden="true">
        <span style={{ transform: `scaleX(${Math.min(hechas / total, 1)})` }} />
      </div>
    </div>
  )
}

/** Reloj analógico: marcas, agujas y un arco con lo que llevamos de jornada. */
function Reloj({ minutos, p }: { minutos: number; p: number }) {
  const angHora = ((minutos / 60) % 12) * 30
  const angMin = (minutos % 60) * 6
  // Arco desde las 9:00 (270º) hasta la hora actual.
  const r = 88
  const inicio = 270
  const barrido = p * 240 // 8 horas = 240º
  const a0 = ((inicio - 90) * Math.PI) / 180
  const a1 = ((inicio + barrido - 90) * Math.PI) / 180
  const x0 = 100 + r * Math.cos(a0)
  const y0 = 100 + r * Math.sin(a0)
  const x1 = 100 + r * Math.cos(a1)
  const y1 = 100 + r * Math.sin(a1)
  const grande = barrido > 180 ? 1 : 0

  return (
    <svg className="pm-workday__clock" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="94" className="pm-workday__face" />
      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={i}
          x1="100"
          y1={i % 3 === 0 ? 14 : 18}
          x2="100"
          y2="26"
          className="pm-workday__tick"
          transform={`rotate(${i * 30} 100 100)`}
        />
      ))}
      {barrido > 0.5 && (
        <path
          d={`M ${x0} ${y0} A ${r} ${r} 0 ${grande} 1 ${x1} ${y1}`}
          className="pm-workday__arc"
        />
      )}
      <line x1="100" y1="100" x2="100" y2="56" className="pm-workday__hand pm-workday__hand--h" transform={`rotate(${angHora} 100 100)`} />
      <line x1="100" y1="100" x2="100" y2="36" className="pm-workday__hand" transform={`rotate(${angMin} 100 100)`} />
      <circle cx="100" cy="100" r="5" className="pm-workday__pin" />
    </svg>
  )
}
