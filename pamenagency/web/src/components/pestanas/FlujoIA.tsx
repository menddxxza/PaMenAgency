import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Diagrama interactivo: cómo pasa una empresa de cómo trabaja hoy a un
 * resultado, en cinco etapas conectadas por líneas doradas.
 *
 * - Sin nada seleccionado, el flujo completo está vivo: puntos de luz recorren
 *   todas las conexiones.
 * - Al elegir una etapa, se ilumina con sus dos conexiones y se explica.
 * - Se navega con los botones, con las flechas del teclado o tocando las etapas.
 * - En escritorio las etapas van en fila; en móvil, en columna, y la explicación
 *   se abre debajo de la etapa tocada.
 * - Con «reducir movimiento» las líneas aparecen enteras y no hay puntos de luz.
 */

type Etapa = { nombre: string; titulo: string; texto: string; puntos: string[] }

const ETAPAS: Etapa[] = [
  {
    nombre: 'Empresa',
    titulo: 'Se parte de cómo trabajáis hoy.',
    texto: 'Antes de hablar de tecnología, miramos vuestros procesos, la información que manejáis y las herramientas que ya usáis.',
    puntos: ['Procesos empresariales', 'Información', 'Herramientas existentes'],
  },
  {
    nombre: 'Análisis',
    titulo: 'Lo repetitivo, separado de lo que exige criterio.',
    texto: 'Detectamos las tareas que se repiten y ordenamos las oportunidades por impacto y esfuerzo. Lo que no compensa se descarta por escrito.',
    puntos: ['Detección de tareas repetitivas', 'Identificación de oportunidades', 'Evaluación de necesidades'],
  },
  {
    nombre: 'Inteligencia artificial',
    titulo: 'IA sólo donde aporta algo real.',
    texto: 'Modelos de lenguaje que leen y redactan, agentes que ejecutan pasos y automatizaciones que funcionan solas, con revisión humana donde hace falta.',
    puntos: ['Agentes de IA', 'Modelos de lenguaje', 'Automatizaciones inteligentes'],
  },
  {
    nombre: 'Integración',
    titulo: 'Conectada a lo que ya usáis.',
    texto: 'Se enlaza con vuestros programas por sus conexiones oficiales, para que la información circule sola y no haya que copiarla a mano.',
    puntos: ['Conexión entre aplicaciones', 'Flujos de trabajo', 'Sistemas empresariales'],
  },
  {
    nombre: 'Resultado',
    titulo: 'Menos trabajo a mano, medido.',
    texto: 'Procesos que funcionan con menos tareas manuales, revisados con los criterios que se acordaron al principio.',
    puntos: ['Procesos optimizados', 'Menos tareas manuales', 'Mayor eficiencia operativa'],
  },
]

const n2 = (i: number) => String(i + 1).padStart(2, '0')

export function FlujoIA() {
  const [sel, setSel] = useState<number | null>(null)
  const raiz = useRef<HTMLDivElement>(null)
  const escena = useRef<HTMLDivElement>(null)
  const orbes = useRef<(HTMLSpanElement | null)[]>([])
  const caminos = useRef<(SVGPathElement | null)[]>([])
  const luces = useRef<(SVGCircleElement | null)[]>([])
  const [trazados, setTrazados] = useState<string[]>([])
  const [caja, setCaja] = useState({ w: 0, h: 0 })
  const [visible, setVisible] = useState(false)
  const selRef = useRef<number | null>(null)
  selRef.current = sel

  // Conexiones entre los centros de los orbes: curvas suaves, en fila o en columna.
  const medir = useCallback(() => {
    const e = escena.current
    if (!e) return
    // Con offsets y no con getBoundingClientRect: así no influyen la animación
    // de entrada ni la escala de la etapa elegida.
    const c = orbes.current.map((o) => {
      let x = o!.offsetWidth / 2, y = o!.offsetHeight / 2
      for (let el: HTMLElement | null = o; el && el !== e; el = el.offsetParent as HTMLElement | null) {
        x += el.offsetLeft
        y += el.offsetTop
      }
      return { x, y, rad: o!.offsetWidth / 2 }
    })
    const vertical = c.length > 1 && Math.abs(c[1].x - c[0].x) < Math.abs(c[1].y - c[0].y)
    const d = c.slice(0, -1).map((a, i) => {
      const b = c[i + 1]
      if (vertical) {
        const y1 = a.y + a.rad + 6, y2 = b.y - b.rad - 6, m = (y1 + y2) / 2
        return `M${a.x} ${y1} C${a.x} ${m} ${b.x} ${m} ${b.x} ${y2}`
      }
      const x1 = a.x + a.rad + 8, x2 = b.x - b.rad - 8, m = (x1 + x2) / 2
      return `M${x1} ${a.y} C${m} ${a.y} ${m} ${b.y} ${x2} ${b.y}`
    })
    setCaja({ w: e.offsetWidth, h: e.offsetHeight })
    setTrazados(d)
  }, [])

  useLayoutEffect(() => {
    medir()
    const ro = new ResizeObserver(medir)
    if (escena.current) ro.observe(escena.current)
    return () => ro.disconnect()
  }, [medir, sel])

  // Aparición al entrar en pantalla y pausa fuera de ella.
  useEffect(() => {
    const el = raiz.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Puntos de luz recorriendo las conexiones.
  useEffect(() => {
    if (!visible || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const t0 = performance.now()
    const tick = (ahora: number) => {
      const t = (ahora - t0) / 1000
      const s = selRef.current
      caminos.current.forEach((p, i) => {
        const luz = luces.current[i]
        if (!p || !luz) return
        const activa = s === null || i === s - 1 || i === s
        if (!activa) { luz.style.opacity = '0'; return }
        const L = p.getTotalLength()
        const f = (t * 0.32 + (s === null ? i * 0.2 : 0)) % 1
        const pt = p.getPointAtLength(L * f)
        luz.setAttribute('cx', String(pt.x))
        luz.setAttribute('cy', String(pt.y))
        luz.style.opacity = String(Math.sin(Math.PI * f))
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [visible, trazados])

  const ir = (i: number | null) => setSel(i === null ? null : (i + ETAPAS.length) % ETAPAS.length)
  const teclado = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); ir(sel === null ? 0 : sel + 1) }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); ir(sel === null ? ETAPAS.length - 1 : sel - 1) }
    if (e.key === 'Escape') ir(null)
  }

  const actual = sel === null ? null : ETAPAS[sel]

  return (
    <div className="pt-flujo" ref={raiz} data-visible={visible || undefined} data-sel={sel ?? undefined} onKeyDown={teclado}>
      <div className="pt-flujo__escena" ref={escena}>
        <svg className="pt-flujo__lineas" width={caja.w} height={caja.h} viewBox={`0 0 ${caja.w || 1} ${caja.h || 1}`} aria-hidden="true">
          <defs>
            <linearGradient id="pt-flujo-oro" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#7A5424" />
              <stop offset="0.5" stopColor="#E8CB94" />
              <stop offset="1" stopColor="#7A5424" />
            </linearGradient>
            <filter id="pt-flujo-brillo" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {trazados.map((d, i) => {
            const activa = sel === null || i === sel - 1 || i === sel
            return (
              <g key={i} className="pt-flujo__conexion" data-activa={activa || undefined} style={{ '--i': i } as React.CSSProperties}>
                <path d={d} className="pt-flujo__guia" />
                <path d={d} className="pt-flujo__trazo" pathLength={1} ref={(el) => { caminos.current[i] = el }} />
                <circle r={4} className="pt-flujo__halo" filter="url(#pt-flujo-brillo)" ref={(el) => { luces.current[i] = el }} />
              </g>
            )
          })}
        </svg>

        <ol className="pt-flujo__nodos">
          {ETAPAS.map((e, i) => (
            <li key={e.nombre} className="pt-flujo__item" style={{ '--i': i } as React.CSSProperties}>
              <button
                type="button"
                className="pt-flujo__nodo"
                aria-pressed={sel === i}
                aria-controls="pt-flujo-panel"
                onClick={() => setSel(sel === i ? null : i)}
              >
                <span className="pt-flujo__orbe" ref={(el) => { orbes.current[i] = el }}>
                  <span className="pt-flujo__num">{n2(i)}</span>
                </span>
                <span className="pt-flujo__nombre">{e.nombre}</span>
              </button>
              {/* En móvil, la explicación se abre justo debajo de la etapa tocada. */}
              {sel === i && (
                <div className="pt-flujo__detalle">
                  <p className="pt-flujo__titulo">{e.titulo}</p>
                  <p>{e.texto}</p>
                  <ul>{e.puntos.map((p) => <li key={p}>{p}</li>)}</ul>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="pt-flujo__panel" id="pt-flujo-panel" aria-live="polite">
        <div className="pt-flujo__contenido" key={sel ?? 'todo'}>
          <p className="pt-flujo__etq">{actual ? `Etapa ${n2(sel!)} de ${n2(ETAPAS.length - 1)}` : 'El flujo completo'}</p>
          <p className="pt-flujo__titulo">{actual ? actual.titulo : 'De cómo trabajáis hoy a un resultado medible.'}</p>
          <p className="pt-flujo__texto">
            {actual ? actual.texto : 'Cinco etapas, siempre en este orden. Elige cualquiera para ver qué ocurre en ella.'}
          </p>
          {actual && (
            <ul className="pt-flujo__puntos">
              {actual.puntos.map((p) => <li key={p}>{p}</li>)}
            </ul>
          )}
        </div>
        <div className="pt-flujo__nav">
          <button type="button" className="pt-flujo__flecha" onClick={() => ir(sel === null ? ETAPAS.length - 1 : sel - 1)} aria-label="Etapa anterior">←</button>
          <button type="button" className="pt-flujo__todo" onClick={() => ir(null)} disabled={sel === null}>Ver el flujo completo</button>
          <button type="button" className="pt-flujo__flecha" onClick={() => ir(sel === null ? 0 : sel + 1)} aria-label="Etapa siguiente">→</button>
        </div>
      </div>
    </div>
  )
}
