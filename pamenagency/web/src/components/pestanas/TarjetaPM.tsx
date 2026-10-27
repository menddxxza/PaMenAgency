import { useCallback, useRef } from 'react'

/**
 * Las tarjetas de visita de la portada: la fotografía real de las tarjetas
 * marfil con el monograma P/M en oro, sobre terciopelo. Los bordes de la
 * foto se funden con el terciopelo del fondo de la web.
 *
 * Con ratón, la foto se inclina un poco hacia el puntero y un reflejo pasa
 * por encima, como cuando se mueve una tarjeta con estampado en oro bajo la
 * luz. En táctil o con movimiento reducido se queda quieta.
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
    el.style.setProperty('--ry', `${(x * 6).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`)
    el.style.setProperty('--luz', `${((x + 0.5) * 100).toFixed(1)}%`)
  }, [])

  const onPointerLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--luz', '35%')
  }, [])

  return (
    <div ref={ref} className="pt-tarjeta" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <div className="pt-tarjeta__foto">
        <img
          src="/tarjetas-pm.webp"
          alt="Tarjetas de visita de PaMenAgency: papel marfil con el monograma P/M estampado en oro, sobre terciopelo burdeos"
          width={1102}
          height={960}
          decoding="async"
        />
        <span className="pt-tarjeta__reflejo" aria-hidden="true" />
      </div>
    </div>
  )
}
