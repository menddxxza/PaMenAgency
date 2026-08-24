import { useEffect, useRef } from 'react'

// Expone la posición del ratón dentro del elemento como variables CSS
// --mx/--my (rango -0.5..0.5), para un efecto sutil de paralaje en el hero.
// No hace nada en touch/reduced-motion: las variables quedan en 0.
export function useMouseParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    function handleMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      el!.style.setProperty('--mx', x.toFixed(3))
      el!.style.setProperty('--my', y.toFixed(3))
    }

    function handleLeave() {
      el!.style.setProperty('--mx', '0')
      el!.style.setProperty('--my', '0')
    }

    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return ref
}
