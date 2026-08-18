import { useCallback, useEffect, useRef, useState } from 'react'

/** ¿El usuario ha pedido reducir el movimiento en su sistema? */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/**
 * Revela los elementos `.pm-reveal` que haya dentro del nodo observado.
 *
 * Un único observador por contenedor en lugar de uno por elemento: menos
 * trabajo para el navegador en páginas largas.
 */
export function useRevealRoot<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    // Sólo lo que aún no se ha revelado: el efecto se vuelve a ejecutar en
    // cada render para recoger contenido nuevo (por ejemplo, al filtrar una
    // rejilla), y no tiene sentido reobservar lo que ya está visible.
    const targets = root.querySelectorAll<HTMLElement>('.pm-reveal:not([data-visible="true"])')
    if (!targets.length) return

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      targets.forEach((el) => el.setAttribute('data-visible', 'true'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute('data-visible', 'true')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  })

  return ref
}

/**
 * Escribe la posición del cursor dentro del elemento como variables CSS
 * (`--mx`, `--my`), que las tarjetas usan para el resplandor.
 */
export function useSpotlight() {
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }, [])

  return { onPointerMove }
}

/** Desplazamiento leve de un elemento en función del scroll (parallax). */
export function useParallax<T extends HTMLElement>(strength = 0.08) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -strength
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [strength])

  return ref
}

/** Progreso de lectura de 0 a 1 sobre el elemento indicado. */
export function useReadingProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      if (total <= 0) {
        setProgress(rect.bottom <= window.innerHeight ? 1 : 0)
        return
      }
      const done = Math.min(Math.max(-rect.top / total, 0), 1)
      setProgress(done)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return { ref, progress }
}

/**
 * Decide si este dispositivo debe ejecutar las escenas 3D.
 *
 * Criterios: sin preferencia de movimiento reducido, con suficiente memoria y
 * núcleos, y con una pantalla que no sea la de un móvil pequeño. En cuanto uno
 * falla se sirve la versión estática, que es visualmente equivalente.
 */
export function useCanRender3D(): boolean {
  const [can, setCan] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(max-width: 640px)').matches) return

    const nav = navigator as Navigator & { deviceMemory?: number }
    if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4) return
    if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency < 4) return

    // Comprobación real de WebGL: hay equipos que lo tienen deshabilitado.
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
      if (!gl) return
    } catch {
      return
    }

    setCan(true)
  }, [])

  return can
}
