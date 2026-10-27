import { Link } from 'react-router-dom'
import { useRevealRoot } from '@/lib/motion'

/**
 * Piezas comunes de las seis pestañas.
 *
 * Todo lo que lleva `pm-reveal` dentro de un `Bloque` o de una `CabeceraPestana`
 * aparece al entrar en pantalla: es el único movimiento ligado al scroll.
 */

/** Antetítulo con la barra del monograma delante. */
export function Antetitulo({ children }: { children: React.ReactNode }) {
  return <p className="pt-eyebrow">{children}</p>
}

/** Cabecera de pestaña: antetítulo, titular grande y entradilla. */
export function CabeceraPestana({
  antetitulo,
  titulo,
  entradilla,
  children,
}: {
  antetitulo: string
  /** Admite `<em>` para la palabra en oro. */
  titulo: React.ReactNode
  entradilla?: React.ReactNode
  children?: React.ReactNode
}) {
  const ref = useRevealRoot<HTMLElement>()
  return (
    <header className="pt-tabhead" ref={ref}>
      <div className="pm-container">
        <div className="pm-reveal">
          <Antetitulo>{antetitulo}</Antetitulo>
        </div>
        <h1 className="pt-tabhead__title pm-reveal" style={{ '--reveal-delay': '80ms' } as React.CSSProperties}>
          {titulo}
        </h1>
        {entradilla && (
          <p className="pt-tabhead__lead pm-reveal" style={{ '--reveal-delay': '180ms' } as React.CSSProperties}>
            {entradilla}
          </p>
        )}
        {children && (
          <div className="pm-reveal" style={{ '--reveal-delay': '260ms' } as React.CSSProperties}>
            {children}
          </div>
        )}
      </div>
    </header>
  )
}

/** Sección de una pestaña, con su propio observador de aparición. */
export function Bloque({
  id,
  children,
  className = '',
  estrecho = false,
}: {
  id?: string
  children: React.ReactNode
  className?: string
  /** Ancho de lectura, para textos largos y preguntas. */
  estrecho?: boolean
}) {
  const ref = useRevealRoot<HTMLElement>()
  return (
    <section id={id} ref={ref} className={`pt-block ${className}`.trim()}>
      <div className={`pm-container${estrecho ? ' pm-container--reading' : ''}`}>{children}</div>
    </section>
  )
}

/** Retardo escalonado para listas que aparecen elemento a elemento. */
export const escalon = (i: number, paso = 70) =>
  ({ '--reveal-delay': `${Math.min(i, 6) * paso}ms` }) as React.CSSProperties

/** Enlace con flecha, para "ver más" dentro de un bloque. */
export function EnlaceFlecha({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="pt-arrowlink">
      <span>{children}</span>
      <span className="pt-arrowlink__arrow" aria-hidden="true">
        →
      </span>
    </Link>
  )
}

/** Cierre de cada pestaña: una frase y dos salidas. */
export function LlamadaFinal({
  titulo = (
    <>
      ¿Y si <em>empezamos</em>?
    </>
  ),
  texto = 'No hace falta que traigas nada preparado ni que sepas qué necesitas. Con que nos cuentes cómo es tu semana, sobra para empezar.',
  principal = { label: 'Cuéntanos tu caso', to: '/contacto' },
  secundaria = { label: 'Pedir auditoría de IA', to: '/auditoria-ia' },
}: {
  titulo?: React.ReactNode
  texto?: string
  principal?: { label: string; to: string }
  secundaria?: { label: string; to: string } | null
}) {
  return (
    <Bloque className="pt-final">
      <div className="pt-final__inner pm-reveal">
        <span className="pt-final__slash" aria-hidden="true" />
        <h2 className="pt-final__title">{titulo}</h2>
        <p className="pt-final__text">{texto}</p>
        <div className="pt-actions">
          <Link className="pt-btn pt-btn--gold" to={principal.to}>
            {principal.label}
            <span aria-hidden="true">→</span>
          </Link>
          {secundaria && (
            <Link className="pt-btn pt-btn--line" to={secundaria.to}>
              {secundaria.label}
            </Link>
          )}
        </div>
      </div>
    </Bloque>
  )
}
