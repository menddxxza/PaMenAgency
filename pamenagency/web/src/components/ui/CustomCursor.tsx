import { useEffect, useRef, useState } from 'react'

/**
 * Cursor personalizado, sólo en escritorio con ratón.
 *
 * El cursor nativo se oculta desde JavaScript (clase en `<html>`), nunca desde
 * la hoja de estilos: si algo falla al montar el componente, el usuario
 * conserva su cursor de siempre en lugar de quedarse sin ninguno.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const wide = window.matchMedia('(min-width: 1080px)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || !wide || reduced) return

    setEnabled(true)
    document.documentElement.classList.add('pm-has-cursor')
    return () => document.documentElement.classList.remove('pm-has-cursor')
  }, [])

  useEffect(() => {
    if (!enabled) return

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let ringX = x
    let ringY = y
    let frame = 0

    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`

      // El anillo crece sobre cualquier elemento interactivo.
      const target = e.target as HTMLElement | null
      const hot = !!target?.closest('a, button, input, textarea, select, [role="tab"]')
      ringRef.current?.setAttribute('data-hot', String(hot))
    }

    // El anillo persigue al punto con inercia: es lo que da la sensación de peso.
    const loop = () => {
      ringX += (x - ringX) * 0.16
      ringY += (y - ringY) * 0.16
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0)`
      }
      frame = requestAnimationFrame(loop)
    }

    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = '0'
      if (ringRef.current) ringRef.current.style.opacity = '0'
    }
    const onEnter = () => {
      if (dotRef.current) dotRef.current.style.opacity = '1'
      if (ringRef.current) ringRef.current.style.opacity = '1'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerenter', onEnter)
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerenter', onEnter)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div ref={dotRef} className="pm-cursor pm-cursor__dot" aria-hidden="true" />
      <div ref={ringRef} className="pm-cursor pm-cursor__ring" aria-hidden="true" />
    </>
  )
}
