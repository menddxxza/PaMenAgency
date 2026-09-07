import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/lib/motion'
import { createCinematicScroll, ScrollTrigger } from '@/lib/cinematicScroll'
import { JourneyCanvas, type JourneyCanvasHandle } from '@/components/three/JourneyCanvas'
import { Section, Reveal } from '@/components/ui/Section'
import { SceneIntro } from './SceneIntro'
import { SceneProblem } from './SceneProblem'
import { SceneAbout } from './SceneAbout'
import { SceneAdvantage } from './SceneAdvantage'
import { SceneProducts } from './SceneProducts'
import { SceneServices } from './SceneServices'

const SCENES = [SceneIntro, SceneProblem, SceneAbout, SceneAdvantage, SceneProducts, SceneServices]
const SCENE_COUNT = SCENES.length

/**
 * El "viaje" cinematográfico: Intro → El punto de partida → Quiénes somos →
 * La IA como ventaja → Productos → Servicios, fijado en pantalla mientras
 * dura el scroll y con un único mundo WebGL de fondo (`JourneyCanvas`) que
 * se transforma con el progreso en vez de reiniciarse en cada escena.
 *
 * El pin + scroll-scrubbing (esta parte) se sirve también en móvil: es
 * CSS/transform y un listener de scroll, ligero en cualquier gama. Lo único
 * que de verdad pesa es el mundo WebGL, y ese ya se protege por su cuenta
 * dentro de `JourneyCanvas` (usa `useCanRender3D()` — pantalla ancha,
 * memoria/núcleos suficientes, WebGL real) sirviendo su versión estática en
 * SVG en cualquier móvil sin que el resto del viaje se entere. Lo único que
 * de verdad desactiva el viaje entero es `prefers-reduced-motion`: ahí sí
 * se sirve `StackedJourney`, el mismo contenido en flujo vertical normal.
 */
export function CinematicJourney() {
  const reduced = usePrefersReducedMotion()

  if (reduced) return <StackedJourney />
  return <PinnedJourney />
}

function PinnedJourney() {
  const trackRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<JourneyCanvasHandle>(null)
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const track = trackRef.current
    const stage = stageRef.current
    if (!track || !stage) return

    const { destroy } = createCinematicScroll()

    let lastProgress = 0
    let lastTime = performance.now()

    // Extraída de `onUpdate` para poder llamarla una vez de inmediato: sin
    // esto, antes del primer scroll ninguna escena tenía `--enter` todavía
    // escrito y el CSS caía a su valor por defecto (1, pensado para el modo
    // apilado), así que las 6 aparecían superpuestas a la vez al cargar.
    const applyProgress = (progress: number) => {
      const now = performance.now()
      const dt = Math.max((now - lastTime) / 1000, 0.001)
      // Velocidad normalizada 0..1: cuánto se movió el progreso por segundo,
      // acotado a un rango razonable. Alimenta el desenfoque del mundo 3D
      // y un ligero "empuje" extra en la escena activa cuando se hace
      // scroll rápido — la velocidad como variable del sistema de motion,
      // no como animación aparte.
      const velocity = Math.min(Math.abs(progress - lastProgress) / dt / 1.4, 1)
      lastProgress = progress
      lastTime = now

      worldRef.current?.setProgress(progress)
      stage.style.setProperty('--vel', velocity.toFixed(3))

      const scaled = progress * (SCENE_COUNT - 1)
      sceneRefs.current.forEach((el, i) => {
        if (!el) return
        const raw = scaled - i
        const linear = Math.max(0, 1 - Math.min(Math.abs(raw), 1))
        const eased = linear * linear * (3 - 2 * linear)
        el.style.setProperty('--enter', eased.toFixed(3))
        el.style.transform = `translate3d(0, ${(-raw * 30).toFixed(1)}px, 0) scale(${(0.965 + eased * 0.035).toFixed(3)})`
        el.style.opacity = eased.toFixed(3)
        el.style.pointerEvents = eased > 0.6 ? 'auto' : 'none'
        if (eased > 0.04) el.removeAttribute('aria-hidden')
        else el.setAttribute('aria-hidden', 'true')
      })
    }

    const trigger = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      // Lenis ya suaviza el scroll en sí — un `scrub` numérico aquí añade un
      // SEGUNDO retraso encima del de Lenis. Con los dos apilados, a
      // velocidad de scroll normal la animación siempre iba muy por detrás
      // de la posición real y las escenas se cortaban antes de llegar a
      // verse (solo se apreciaban bien scrolleando muy despacio). `true`
      // sigue la posición ya suavizada de Lenis sin sumar un retraso propio.
      scrub: true,
      pin: stage,
      // `Layout.tsx` envuelve cada página en `.pm-pagefade`, que anima
      // `transform` en su entrada (`animation: ... both`) — eso convierte a
      // ese ancestro en el bloque contenedor de cualquier `position:fixed`
      // dentro, aunque el propio ScrollTrigger detecte `pinType:'fixed'`
      // como seguro al montar. Fijar aquí `pinType:'transform'` evita
      // depender de `position:fixed` y con ello el problema entero.
      pinType: 'transform',
      onUpdate: (self) => applyProgress(self.progress),
    })

    applyProgress(trigger.progress)

    return () => {
      trigger.kill()
      destroy()
    }
  }, [])

  return (
    <div className="pm-journey">
      <div className="pm-journey__track" ref={trackRef} style={{ height: `${SCENE_COUNT * 100}vh` }}>
        <div className="pm-journey__stage" ref={stageRef}>
          <JourneyCanvas ref={worldRef} sceneCount={SCENE_COUNT} className="pm-journey__world" />
          {SCENES.map((SceneComp, i) => (
            <div
              key={i}
              className="pm-journey__scene"
              ref={(el) => {
                sceneRefs.current[i] = el
              }}
              aria-hidden={i === 0 ? undefined : 'true'}
            >
              <SceneComp />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Mismo contenido, mismo orden, sin pin/scrub/WebGL — para móvil, equipos modestos y `prefers-reduced-motion`. */
function StackedJourney() {
  return (
    <>
      <Section id="inicio" divided={false}>
        <Reveal>
          <SceneIntro />
        </Reveal>
      </Section>
      <Section id="el-punto-de-partida">
        <Reveal>
          <SceneProblem />
        </Reveal>
      </Section>
      <Section id="quienes-somos">
        <Reveal>
          <SceneAbout />
        </Reveal>
      </Section>
      <Section id="ventaja">
        <Reveal>
          <SceneAdvantage />
        </Reveal>
      </Section>
      <Section id="productos">
        <Reveal>
          <SceneProducts />
        </Reveal>
      </Section>
      <Section id="servicios">
        <Reveal>
          <SceneServices />
        </Reveal>
      </Section>
    </>
  )
}
