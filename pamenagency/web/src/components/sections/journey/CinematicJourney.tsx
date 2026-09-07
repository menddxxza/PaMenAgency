import { useEffect, useRef } from 'react'
import { useCanRender3D } from '@/lib/motion'
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

// Alto de scroll por escena. Antes eran 100vh y la escena solo estaba
// "sola" en el instante exacto del centro — el resto del tiempo ya se
// estaba cruzando con la vecina (ver PLATEAU más abajo). Subirlo a 140vh
// da más recorrido de scroll a cada escena.
const VH_PER_SCENE = 140
// Fracción del tramo entre dos escenas donde la activa se queda quieta a
// opacidad 1, sin que la siguiente empiece a entrar todavía. Con 0.35 aún
// quedaba una franja del 30% del tramo donde ambas se veían a la vez (el
// texto de una se leía a través del otro). En 0.45 esa franja baja al 10%:
// un cruce mucho más corto y limpio, casi un relevo en vez de una mezcla.
const PLATEAU = 0.45

/**
 * El "viaje" cinematográfico: Intro → El punto de partida → Quiénes somos →
 * La IA como ventaja → Productos → Servicios, fijado en pantalla mientras
 * dura el scroll y con un único mundo WebGL de fondo (`JourneyCanvas`) que
 * se transforma con el progreso en vez de reiniciarse en cada escena.
 *
 * Solo se activa si `useCanRender3D()` lo permite (desktop capaz, sin
 * `prefers-reduced-motion`, con WebGL real) — ese hook ya agrupa todas esas
 * condiciones. Si falla cualquiera, se sirve `StackedJourney`: el mismo
 * contenido, en el mismo orden, en flujo vertical normal con el
 * revelado-al-hacer-scroll que ya usa el resto del sitio. Nunca hay una
 * versión rota o a medias.
 */
export function CinematicJourney() {
  const cinematic = useCanRender3D()

  if (!cinematic) return <StackedJourney />
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
        const absRaw = Math.min(Math.abs(raw), 1)
        // Meseta: dentro de ±PLATEAU la escena está sola, a opacidad 1.
        // Fuera de ella (hasta ±1, el punto donde manda la vecina), se
        // desvanece — en una franja más corta que el tramo completo, así
        // que ya no pasa casi todo el scroll "a medias" entre dos escenas.
        const linear = absRaw <= PLATEAU ? 1 : Math.max(0, 1 - (absRaw - PLATEAU) / (1 - PLATEAU))
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
      <div className="pm-journey__track" ref={trackRef} style={{ height: `${SCENE_COUNT * VH_PER_SCENE}vh` }}>
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
