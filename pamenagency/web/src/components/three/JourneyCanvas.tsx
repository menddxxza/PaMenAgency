import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useCanRender3D } from '@/lib/motion'
import type { JourneyWorldHandle } from './journeyWorld'
import { StaticScene } from './StaticScene'

export type JourneyCanvasHandle = {
  setProgress: (progress: number) => void
}

/**
 * Monta el mundo WebGL compartido del viaje cinematográfico.
 *
 * Mismo patrón que `Scene3D.tsx`: import diferido de `three`, gate por
 * `useCanRender3D()` y fallback estático si el dispositivo no puede o si
 * falla la inicialización. A diferencia de `Scene3D`, expone un método
 * imperativo (`setProgress`) para que el orquestador del scroll (GSAP
 * ScrollTrigger) empuje el progreso sin causar un re-render de React en
 * cada frame.
 */
export const JourneyCanvas = forwardRef<JourneyCanvasHandle, { sceneCount: number; className?: string }>(
  function JourneyCanvas({ sceneCount, className }, ref) {
    const can3D = useCanRender3D()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const wrapRef = useRef<HTMLDivElement>(null)
    const worldRef = useRef<JourneyWorldHandle | null>(null)
    const pendingProgress = useRef(0)
    const [failed, setFailed] = useState(false)

    useImperativeHandle(
      ref,
      () => ({
        setProgress(progress: number) {
          pendingProgress.current = progress
          worldRef.current?.setProgress(progress)
        },
      }),
      [],
    )

    useEffect(() => {
      if (!can3D) return
      const canvas = canvasRef.current
      const wrap = wrapRef.current
      if (!canvas || !wrap) return

      let cancelled = false
      let observer: IntersectionObserver | null = null

      const quality: 'high' | 'low' =
        (navigator as Navigator & { deviceMemory?: number }).deviceMemory !== undefined &&
        (navigator as Navigator & { deviceMemory?: number }).deviceMemory! < 8
          ? 'low'
          : 'high'

      import('./journeyWorld')
        .then(({ createJourneyWorld }) => {
          if (cancelled) return
          const world = createJourneyWorld({ canvas, quality, sceneCount })
          worldRef.current = world
          world.setProgress(pendingProgress.current)

          observer = new IntersectionObserver(([entry]) => world.setPaused(!entry.isIntersecting), { threshold: 0.01 })
          observer.observe(wrap)
        })
        .catch(() => {
          if (!cancelled) setFailed(true)
        })

      return () => {
        cancelled = true
        observer?.disconnect()
        worldRef.current?.dispose()
        worldRef.current = null
      }
    }, [can3D, sceneCount])

    if (!can3D || failed) {
      return <StaticScene kind="core" className={className} />
    }

    return (
      <div ref={wrapRef} className={`pm-scene ${className ?? ''}`.trim()} aria-hidden="true">
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    )
  },
)
