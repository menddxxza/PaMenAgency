import { useEffect } from 'react'
import { useConsent } from './consent'

const CLARITY_ID = import.meta.env.VITE_CLARITY_ID as string | undefined

let cargado = false

/** Inyecta el script oficial de Clarity una sola vez. */
function inyectarClarity(id: string) {
  if (cargado) return
  cargado = true
  ;(function (c: any, l: Document, a: string, r: string) {
    c[a] =
      c[a] ||
      function (...args: unknown[]) {
        ;(c[a].q = c[a].q || []).push(args)
      }
    const t = l.createElement(r) as HTMLScriptElement
    t.async = true
    t.src = 'https://www.clarity.ms/tag/' + id
    const y = l.getElementsByTagName(r)[0]
    y.parentNode?.insertBefore(t, y)
  })(window, document, 'clarity', 'script')
}

/**
 * Microsoft Clarity (grabación de sesión y mapas de calor), sólo si:
 * 1. Hay un ID configurado — variable de entorno `VITE_CLARITY_ID` en
 *    Vercel (Project Settings → Environment Variables). Sin ella, esto no
 *    hace nada: no hay cuenta de Clarity creada todavía.
 * 2. La categoría "Estadísticas" del banner de cookies está aceptada.
 *
 * A diferencia de Vercel Analytics (agregado, sin cookies, por eso se
 * carga siempre), Clarity sí identifica la sesión para poder reproducirla
 * — cae de lleno en la categoría que ya existe en el banner, y por eso
 * pasa por el mismo consentimiento que cualquier otra herramienta de
 * medición.
 */
export function useClarityConsentida() {
  const { consent, ready } = useConsent()

  useEffect(() => {
    if (!ready || !CLARITY_ID) return
    if (consent?.estadisticas) inyectarClarity(CLARITY_ID)
  }, [ready, consent?.estadisticas])
}
