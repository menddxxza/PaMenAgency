import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

/**
 * Botón para copiar un valor al portapapeles, con confirmación visual breve.
 * Si `navigator.clipboard` no está disponible (contexto no seguro, navegador
 * antiguo), el botón desaparece en vez de fallar en silencio — el texto
 * junto a él sigue siendo seleccionable a mano.
 */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && !!navigator.clipboard)
  }, [])

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  if (!supported) return null

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      // Sin permiso de portapapeles o entorno no seguro: no se hace nada,
      // el valor sigue disponible como texto normal junto al botón.
    }
  }

  return (
    <button
      type="button"
      className="pm-copybtn"
      onClick={copiar}
      aria-label={copied ? `${label} copiado` : `Copiar ${label.toLowerCase()}`}
    >
      <Icon name={copied ? 'check' : 'copy'} size={14} />
      <span aria-hidden="true">{copied ? 'Copiado' : 'Copiar'}</span>
    </button>
  )
}
