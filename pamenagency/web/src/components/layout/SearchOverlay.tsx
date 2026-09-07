import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { services } from '@/content/services'
import { docs } from '@/content/knowledge'

interface Resultado {
  tipo: 'Servicio' | 'Guía'
  titulo: string
  texto: string
  to: string
}

/** Índice de búsqueda: servicios y guías, con lo mismo que ya se ve en sus
 *  propios listados — no se inventa ningún contenido nuevo para esto. */
const indice: Resultado[] = [
  ...services.map((s) => ({
    tipo: 'Servicio' as const,
    titulo: s.name,
    texto: s.short,
    to: `/servicios/${s.slug}`,
  })),
  ...docs.map((d) => ({
    tipo: 'Guía' as const,
    titulo: d.title,
    texto: d.summary,
    to: `/conocimiento/${d.slug}`,
  })),
]

function buscar(query: string): Resultado[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return indice
    .filter((r) => r.titulo.toLowerCase().includes(q) || r.texto.toLowerCase().includes(q))
    .slice(0, 8)
}

/** Buscador del sitio: servicios y guías del centro de conocimiento.
 *  Todo en el cliente — no hay tanto contenido como para justificar un
 *  servicio de búsqueda externo. */
export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const resultados = useMemo(() => buscar(query), [query])

  useEffect(() => {
    inputRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const ir = (to: string) => {
    navigate(to)
    onClose()
  }

  return (
    <div className="pm-search" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="pm-search__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Buscar en el sitio"
      >
        <div className="pm-search__field">
          <Icon name="search" size={18} />
          <input
            ref={inputRef}
            type="search"
            className="pm-search__input"
            placeholder="Buscar servicios y guías…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar en el sitio"
          />
          <button
            type="button"
            className="pm-search__close"
            onClick={onClose}
            aria-label="Cerrar búsqueda"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {query.trim() && (
          <ul className="pm-search__results">
            {resultados.length === 0 ? (
              <li className="pm-search__empty">Sin resultados para «{query}».</li>
            ) : (
              resultados.map((r) => (
                <li key={r.to}>
                  <button type="button" className="pm-search__result" onClick={() => ir(r.to)}>
                    <span className="pm-badge pm-badge--gold" style={{ flex: 'none', marginTop: '0.1rem' }}>
                      {r.tipo}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span className="pm-search__title">{r.titulo}</span>
                      <span className="pm-search__text">{r.texto}</span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
