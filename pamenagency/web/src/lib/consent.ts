import { useCallback, useEffect, useState } from 'react'

/**
 * Consentimiento de cookies.
 *
 * Estado actual del sitio: sólo se usa almacenamiento técnico (la propia
 * preferencia de cookies). No se carga ningún script de analítica ni de
 * marketing, y no se cargará ninguno mientras la categoría correspondiente no
 * esté aceptada. Por eso las categorías existen y se guardan aunque hoy no
 * haya nada que activar: cuando se añada una herramienta, el consentimiento ya
 * estará recogido correctamente y no habrá que retroceder.
 */

export const CONSENT_KEY = 'pm-consent-v1'

export type ConsentCategory = 'necesarias' | 'preferencias' | 'estadisticas' | 'marketing'

export type Consent = Record<ConsentCategory, boolean>

export const categories: {
  key: ConsentCategory
  titulo: string
  texto: string
  obligatoria: boolean
}[] = [
  {
    key: 'necesarias',
    titulo: 'Necesarias',
    texto:
      'Imprescindibles para que la web funcione. Incluyen la que guarda esta misma elección. No pueden desactivarse.',
    obligatoria: true,
  },
  {
    key: 'preferencias',
    titulo: 'Preferencias',
    texto:
      'Recuerdan opciones que eliges durante la visita para no volver a preguntarte en la siguiente.',
    obligatoria: false,
  },
  {
    key: 'estadisticas',
    titulo: 'Estadísticas',
    texto:
      'Permitirían medir de forma agregada qué contenidos se leen, para decidir qué publicar después. Hoy no hay ninguna herramienta de medición activa.',
    obligatoria: false,
  },
  {
    key: 'marketing',
    titulo: 'Marketing',
    texto:
      'Se usarían para medir campañas o mostrar publicidad. Hoy no hay ninguna herramienta de este tipo activa.',
    obligatoria: false,
  },
]

export const defaultConsent: Consent = {
  necesarias: true,
  preferencias: false,
  estadisticas: false,
  marketing: false,
}

export const allAccepted: Consent = {
  necesarias: true,
  preferencias: true,
  estadisticas: true,
  marketing: true,
}

type StoredConsent = { value: Consent; date: string }

const EVENT = 'pm-consent-change'

export function readConsent(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredConsent
    if (!parsed || typeof parsed.value !== 'object') return null
    // Se normaliza por si en el futuro se añaden categorías nuevas.
    return { date: parsed.date, value: { ...defaultConsent, ...parsed.value, necesarias: true } }
  } catch {
    return null
  }
}

export function writeConsent(value: Consent) {
  const stored: StoredConsent = {
    value: { ...value, necesarias: true },
    date: new Date().toISOString(),
  }
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(stored))
  } catch {
    // Almacenamiento no disponible (modo privado, bloqueo del navegador):
    // el banner volverá a aparecer, que es el comportamiento correcto.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: stored }))
}

/** Permite reabrir el panel desde cualquier punto de la web. */
export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent('pm-consent-open'))
}

export function useConsent() {
  const [stored, setStored] = useState<StoredConsent | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setStored(readConsent())
    setReady(true)
    const onChange = () => setStored(readConsent())
    window.addEventListener(EVENT, onChange)
    return () => window.removeEventListener(EVENT, onChange)
  }, [])

  const save = useCallback((value: Consent) => writeConsent(value), [])

  return { consent: stored?.value ?? null, date: stored?.date ?? null, ready, save }
}
