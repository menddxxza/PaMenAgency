import { useRevealRoot } from '@/lib/motion'

/**
 * Contenedor de sección. Monta un único observador de scroll para todos los
 * elementos `.pm-reveal` que contenga.
 */
export function Section({
  id,
  children,
  divided = true,
  className = '',
  container = 'default',
}: {
  id?: string
  children: React.ReactNode
  divided?: boolean
  className?: string
  container?: 'default' | 'wide' | 'reading' | 'none'
}) {
  const ref = useRevealRoot<HTMLElement>()

  const containerClass =
    container === 'none'
      ? ''
      : `pm-container${container === 'wide' ? ' pm-container--wide' : ''}${
          container === 'reading' ? ' pm-container--reading' : ''
        }`

  return (
    <section
      id={id}
      ref={ref}
      className={`pm-section ${divided ? 'pm-section--divided' : ''} ${className}`.trim()}
    >
      {container === 'none' ? children : <div className={containerClass}>{children}</div>}
    </section>
  )
}

/** Cabecera común: antetítulo, título y entradilla. */
export function SectionHead({
  eyebrow,
  title,
  lead,
  align = 'left',
  as: Tag = 'h2',
}: {
  eyebrow?: string
  title: React.ReactNode
  lead?: React.ReactNode
  align?: 'left' | 'center'
  as?: 'h1' | 'h2'
}) {
  return (
    <header
      className="pm-reveal"
      style={{
        marginBottom: 'var(--space-xl)',
        textAlign: align,
        marginInline: align === 'center' ? 'auto' : undefined,
        maxWidth: align === 'center' ? '46rem' : undefined,
      }}
    >
      {eyebrow && <p className="pm-eyebrow">{eyebrow}</p>}
      <Tag className="pm-title">{title}</Tag>
      {lead && (
        <p
          className="pm-lead"
          style={{ marginTop: '1rem', marginInline: align === 'center' ? 'auto' : undefined }}
        >
          {lead}
        </p>
      )}
    </header>
  )
}

/** Envuelve un bloque para que aparezca al entrar en pantalla. */
export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode
  /** Retardo en ms; se usa para escalonar rejillas. */
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'article' | 'section'
}) {
  return (
    <Tag
      className={`pm-reveal ${className}`.trim()}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  )
}
