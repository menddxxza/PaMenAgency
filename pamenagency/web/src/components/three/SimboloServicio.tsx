import { useEffect, useRef, useState } from 'react'
import type { SimboloHandle, SimboloKind } from './simbolos'

/** Qué símbolo representa a cada servicio real del catálogo (content/services.ts). */
const SIMBOLOS: Record<string, SimboloKind> = {
  'automatizacion-de-procesos': 'engranajes',
  'procesamiento-de-documentos': 'documentos',
  'asistente-de-ia-empresarial': 'nucleo',
  'integracion-de-sistemas': 'modulos',
  'consultoria-de-ia': 'esfera',
  formacion: 'bloques',
}

function hayWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Símbolo 3D de un servicio, para colocar dentro de su tarjeta (decorativo).
 *
 * - `three` llega en un chunk aparte y sólo si hay WebGL.
 * - Con movimiento reducido, en pantallas pequeñas o en equipos modestos se
 *   dibuja un único fotograma, sin animación.
 * - Fuera de pantalla no se pinta; dentro, reacciona al ratón sobre la tarjeta.
 * - Si algo falla, no se muestra nada y la tarjeta queda como estaba.
 */
export function SimboloServicio({ slug }: { slug: string }) {
  const kind = SIMBOLOS[slug]
  const ref = useRef<HTMLCanvasElement>(null)
  const [fallo, setFallo] = useState(false)

  useEffect(() => {
    const canvas = ref.current
    if (!kind || !canvas || !hayWebGL()) {
      setFallo(true)
      return
    }
    const nav = navigator as Navigator & { deviceMemory?: number }
    const estatico =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(max-width: 640px)').matches ||
      (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4) ||
      (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency < 4)

    let handle: SimboloHandle | null = null
    let cancelado = false
    let observador: IntersectionObserver | null = null
    const tarjeta = canvas.closest<HTMLElement>('.pm-card') ?? canvas.parentElement!
    const entrar = () => handle?.setHover(true)
    const salir = () => { handle?.setHover(false); handle?.setPuntero(0, 0) }
    const mover = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = tarjeta.getBoundingClientRect()
      handle?.setPuntero(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1)
    }

    import('./simbolos')
      .then(({ montarSimbolo }) => {
        if (cancelado) return
        handle = montarSimbolo(canvas, kind, { estatico })
        observador = new IntersectionObserver(([e]) => handle?.setVisible(e.isIntersecting), { threshold: 0.01 })
        observador.observe(canvas)
        tarjeta.addEventListener('pointerenter', entrar)
        tarjeta.addEventListener('pointerleave', salir)
        tarjeta.addEventListener('pointermove', mover)
        tarjeta.addEventListener('focusin', entrar)
        tarjeta.addEventListener('focusout', salir)
      })
      .catch(() => { if (!cancelado) setFallo(true) })

    return () => {
      cancelado = true
      observador?.disconnect()
      tarjeta.removeEventListener('pointerenter', entrar)
      tarjeta.removeEventListener('pointerleave', salir)
      tarjeta.removeEventListener('pointermove', mover)
      tarjeta.removeEventListener('focusin', entrar)
      tarjeta.removeEventListener('focusout', salir)
      handle?.dispose()
    }
  }, [kind])

  if (!kind || fallo) return null
  return (
    <span className="pm-simbolo" aria-hidden="true">
      <canvas ref={ref} width={224} height={224} />
    </span>
  )
}
