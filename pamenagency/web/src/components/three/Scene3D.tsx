import { useEffect, useRef, useState } from 'react'
import { useCanRender3D } from '@/lib/motion'
import type { SceneHandle, SceneKind } from './scenes'
import { StaticScene } from './StaticScene'

/**
 * Monta una escena WebGL sobre un canvas.
 *
 * Tres decisiones importantes:
 * - `three` se importa dinámicamente, así que no entra en el paquete inicial.
 * - Si el dispositivo no cumple los requisitos (móvil, poca memoria, sin
 *   WebGL, movimiento reducido) no se carga nada y se sirve una versión
 *   estática equivalente en SVG.
 * - Fuera de pantalla, la escena se pausa.
 */
export function Scene3D({
  kind,
  className,
  style,
}: {
  kind: SceneKind
  className?: string
  style?: React.CSSProperties
}) {
  const can3D = useCanRender3D()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!can3D) return
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    let handle: SceneHandle | null = null
    let cancelled = false
    let observer: IntersectionObserver | null = null

    const quality: 'high' | 'low' =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory !== undefined &&
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory! < 8
        ? 'low'
        : 'high'

    import('./scenes')
      .then(({ sceneFactories }) => {
        if (cancelled) return
        handle = sceneFactories[kind]({ canvas, quality })

        observer = new IntersectionObserver(
          ([entry]) => handle?.setPaused(!entry.isIntersecting),
          { threshold: 0.01 },
        )
        observer.observe(wrap)
      })
      .catch(() => {
        // Un fallo al cargar o al inicializar WebGL no puede romper la página.
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      observer?.disconnect()
      handle?.dispose()
    }
  }, [can3D, kind])

  if (!can3D || failed) {
    return <StaticScene kind={kind} className={className} style={style} />
  }

  // La colocación la decide quien monta la escena mediante `className`;
  // `pm-scene` sólo aporta el tamaño por defecto.
  return (
    <div
      ref={wrapRef}
      className={`pm-scene ${className ?? ''}`.trim()}
      style={style}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}
