import { Link } from 'react-router-dom'

/**
 * Cabecera de las páginas internas. Mantiene identidad y ritmo respecto a la
 * portada, pero deja el contenido con aire suficiente para leer.
 */
export function PageHead({
  eyebrow,
  title,
  lead,
  breadcrumb,
  children,
}: {
  eyebrow?: string
  title: string
  lead?: React.ReactNode
  breadcrumb?: { label: string; to?: string }[]
  children?: React.ReactNode
}) {
  return (
    <header className="pm-pagehead">
      <div className="pm-grid-lines" aria-hidden="true" />
      <div
        className="pm-glow"
        aria-hidden="true"
        style={{
          width: 'min(560px, 100vw)',
          height: '320px',
          right: '-8%',
          top: '-120px',
          background: 'rgba(212, 175, 55, 0.10)',
        }}
      />

      <div className="pm-container pm-above">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="pm-breadcrumb" aria-label="Ruta de navegación">
            <Link to="/">Inicio</Link>
            {breadcrumb.map((item) => (
              <span key={item.label} className="pm-row" style={{ gap: '0.5rem' }}>
                <span aria-hidden="true">/</span>
                {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
              </span>
            ))}
          </nav>
        )}

        {eyebrow && <p className="pm-eyebrow" style={{ marginTop: '1.25rem' }}>{eyebrow}</p>}
        <h1 className="pm-pagehead__title">{title}</h1>
        {lead && <p className="pm-lead">{lead}</p>}
        {children}
      </div>
    </header>
  )
}
