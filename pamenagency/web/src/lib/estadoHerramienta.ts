import { useEffect, useState } from 'react'

/**
 * Pregunta a la herramienta si ya admite altas (GET <ruta>api/estado).
 * null mientras se comprueba o si no responde: entonces se muestra el alta
 * como abierta y es la propia herramienta la que avisa.
 */
export function useAltasAbiertas(ruta: string): boolean | null {
  const [altas, setAltas] = useState<boolean | null>(null)
  useEffect(() => {
    let vivo = true
    fetch(`${ruta}api/estado`, { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((e) => vivo && e && setAltas(Boolean(e.altas)))
      .catch(() => undefined)
    return () => {
      vivo = false
    }
  }, [ruta])
  return altas
}
