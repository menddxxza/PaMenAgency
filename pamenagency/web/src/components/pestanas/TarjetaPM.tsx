import { useCallback, useRef } from 'react'

/**
 * La tarjeta de visita de la portada: papel marfil con el monograma P/M
 * estampado en oro, sobre el terciopelo del fondo. Es la foto de la marca
 * llevada a la web.
 *
 * Con ratón, la tarjeta se inclina hacia el puntero y el oro refleja la luz.
 * En táctil o con movimiento reducido se queda quieta: es decorativa y el
 * mensaje está en el titular de al lado.
 */
export function TarjetaPM() {
  const ref = useRef<HTMLDivElement>(null)

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${(-y * 12).toFixed(2)}deg`)
    el.style.setProperty('--luz', `${((x + 0.5) * 100).toFixed(1)}%`)
  }, [])

  const onPointerLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--luz', '30%')
  }, [])

  return (
    <div
      ref={ref}
      className="pt-tarjeta"
      aria-hidden="true"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="pt-tarjeta__escena">
        {/* El taco de tarjetas de detrás, con el canto dorado */}
        <div className="pt-tarjeta__papel pt-tarjeta__papel--detras" />
        <div className="pt-tarjeta__papel pt-tarjeta__papel--delante">
          <span className="pt-mono">
            <span className="pt-mono__p">P</span>
            <span className="pt-mono__barra" />
            <span className="pt-mono__m">M</span>
          </span>
          <span className="pt-tarjeta__brillo" />
        </div>
      </div>
    </div>
  )
}
