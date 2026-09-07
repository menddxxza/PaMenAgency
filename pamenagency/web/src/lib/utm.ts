/**
 * Parámetros UTM: de dónde viene una visita (campaña, canal, anuncio…).
 *
 * Se capturan de la URL en cuanto se cargan (solo si vienen, nunca se
 * inventan) y se guardan en sessionStorage para que sigan disponibles si la
 * persona navega por varias páginas antes de llegar al formulario de
 * contacto — no se reenvían al servidor hasta que de verdad hay un lead.
 */

const CAMPOS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

export type UtmParams = Partial<Record<(typeof CAMPOS)[number], string>>

const STORAGE_KEY = 'pm_utm'

/** Llamar una sola vez, al arrancar la app. */
export function capturarUtm(): void {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  const encontrados: UtmParams = {}
  for (const campo of CAMPOS) {
    const valor = params.get(campo)
    if (valor) encontrados[campo] = valor
  }

  if (Object.keys(encontrados).length === 0) return

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(encontrados))
  } catch {
    // Almacenamiento no disponible (modo privado estricto, por ejemplo):
    // simplemente no se recuerda el origen para esta visita.
  }
}

/** Los UTM capturados en esta sesión de navegador, si los hay. */
export function obtenerUtm(): UtmParams {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UtmParams) : {}
  } catch {
    return {}
  }
}
