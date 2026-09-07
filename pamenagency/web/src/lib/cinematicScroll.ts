import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let pluginRegistered = false

/**
 * Conecta Lenis (scroll suave) con GSAP ScrollTrigger — el patrón estándar
 * de ambas librerías: Lenis avanza en el ticker de GSAP en vez de su propio
 * rAF, y cada evento de scroll de Lenis fuerza a ScrollTrigger a
 * recalcular. Se crea y destruye por quien la usa (la Home, mientras dura
 * el viaje cinematográfico) — no es una instancia global ni afecta a otras
 * rutas, igual que `ScrollStack` ya gestiona la suya propia hoy.
 */
export function createCinematicScroll() {
  if (!pluginRegistered) {
    gsap.registerPlugin(ScrollTrigger)
    pluginRegistered = true
  }

  const lenis = new Lenis({
    duration: 1.05,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
  })

  lenis.on('scroll', ScrollTrigger.update)

  const tick = (time: number) => {
    lenis.raf(time * 1000)
  }
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  return {
    lenis,
    destroy() {
      gsap.ticker.remove(tick)
      lenis.destroy()
    },
  }
}

export { gsap, ScrollTrigger }
