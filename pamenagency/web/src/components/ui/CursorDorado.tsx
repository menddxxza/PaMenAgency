import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/** Elementos sobre los que el cursor cambia de estado. */
const BOTON = 'button, .pt-btn, [role="button"], input[type="submit"], input[type="button"], .pm-btn'
const ENLACE = 'a, label, summary, select'
const TARJETA = '.pm-card, .flowing-menu__item, .pt-flujo__nodo, .pt-chip'
const TEXTO = 'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]):not([type="range"]), textarea, [contenteditable="true"]'

/**
 * Cursor propio: un aro fino dorado que sigue al ratón con una ligera inercia
 * y un punto central que va exacto. Crece sobre enlaces, botones y tarjetas.
 *
 * Sólo existe con un puntero preciso (ratón o trackpad) y sin «reducir
 * movimiento». En móviles y tabletas táctiles se queda el cursor del sistema.
 * No intercepta clics, selección de texto ni desplazamiento (pointer-events: none),
 * y sobre los campos de texto se aparta para dejar el cursor de escritura.
 */
export function CursorDorado() {
  const [activo, setActivo] = useState(false)
  const aro = useRef<HTMLDivElement>(null)
  const punto = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fino = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)')
    const actualizar = () => setActivo(fino.matches && !reducido.matches)
    actualizar()
    fino.addEventListener('change', actualizar)
    reducido.addEventListener('change', actualizar)
    return () => {
      fino.removeEventListener('change', actualizar)
      reducido.removeEventListener('change', actualizar)
    }
  }, [])

  useEffect(() => {
    if (!activo) return
    const a = aro.current, p = punto.current
    if (!a || !p) return
    const raiz = document.documentElement
    raiz.classList.add('pt-cursor-on')

    let x = -100, y = -100, ax = -100, ay = -100, frame = 0, visible = false
    const pintar = () => {
      ax += (x - ax) * 0.22
      ay += (y - ay) * 0.22
      a.style.transform = `translate3d(${ax}px, ${ay}px, 0)`
      frame = Math.abs(x - ax) + Math.abs(y - ay) > 0.2 ? requestAnimationFrame(pintar) : 0
    }
    const mover = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x = e.clientX
      y = e.clientY
      p.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (!visible) {
        visible = true
        ax = x
        ay = y
        raiz.setAttribute('data-cursor-visible', '')
      }
      if (!frame) frame = requestAnimationFrame(pintar)
    }
    const sobre = (e: Event) => {
      const t = e.target as Element | null
      if (!t || !t.closest) return
      const estado = t.closest(TEXTO) ? 'texto' : t.closest(BOTON) ? 'boton' : t.closest(ENLACE) ? 'enlace' : t.closest(TARJETA) ? 'tarjeta' : ''
      if (estado) raiz.setAttribute('data-cursor', estado)
      else raiz.removeAttribute('data-cursor')
    }
    const fuera = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        visible = false
        raiz.removeAttribute('data-cursor-visible')
      }
    }
    const pulsar = () => raiz.setAttribute('data-cursor-pulsado', '')
    const soltar = () => raiz.removeAttribute('data-cursor-pulsado')

    window.addEventListener('pointermove', mover, { passive: true })
    document.addEventListener('mouseover', sobre, { passive: true })
    document.addEventListener('mouseout', fuera, { passive: true })
    window.addEventListener('pointerdown', pulsar, { passive: true })
    window.addEventListener('pointerup', soltar, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', mover)
      document.removeEventListener('mouseover', sobre)
      document.removeEventListener('mouseout', fuera)
      window.removeEventListener('pointerdown', pulsar)
      window.removeEventListener('pointerup', soltar)
      raiz.classList.remove('pt-cursor-on')
      ;['data-cursor', 'data-cursor-visible', 'data-cursor-pulsado'].forEach((n) => raiz.removeAttribute(n))
    }
  }, [activo])

  if (!activo) return null
  return createPortal(
    <div className="pt-cursor" aria-hidden="true">
      <div className="pt-cursor__aro" ref={aro}>
        <span />
      </div>
      <div className="pt-cursor__punto" ref={punto}>
        <span />
      </div>
    </div>,
    document.body,
  )
}
