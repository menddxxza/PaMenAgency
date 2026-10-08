import * as Sentry from '@sentry/react'

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined

/**
 * Monitorización de errores en producción.
 *
 * Sin `VITE_SENTRY_DSN` (Vercel → Project Settings → Environment
 * Variables) esto no hace nada: no hay proyecto de Sentry creado
 * todavía. En cuanto exista la variable, se activa solo.
 *
 * No pasa por el consentimiento de cookies, a propósito: a diferencia de
 * Clarity, esto no sigue a nadie ni graba su sesión — sólo recoge el
 * error, su traza y la URL donde ocurrió, para que se pueda arreglar sin
 * depender de que alguien lo reporte por correo. Configurado para no
 * mandar datos de más: esta versión del SDK no manda PII (IP, cookies)
 * salvo que se active explícitamente, y aquí no se activa; sin grabación
 * de sesión y sin seguimiento de rendimiento (tracesSampleRate en 0 salvo
 * que haga falta diagnosticar algo puntual).
 */
export function initSentry() {
  if (!DSN) return
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 0,
    environment: import.meta.env.MODE,
  })
}

export { Sentry }
