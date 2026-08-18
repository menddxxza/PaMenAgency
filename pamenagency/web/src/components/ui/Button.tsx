import { Link } from 'react-router-dom'
import { Icon } from './Icon'

type Variant = 'primary' | 'ghost' | 'solid'

type Common = {
  children: React.ReactNode
  variant?: Variant
  size?: 'md' | 'sm'
  full?: boolean
  /** Muestra la flecha que se desplaza al pasar el cursor. */
  arrow?: boolean
  className?: string
}

type AsLink = Common & { to: string; href?: never; onClick?: never; type?: never; disabled?: never }
type AsAnchor = Common & { href: string; to?: never; onClick?: never; type?: never; disabled?: never }
type AsButton = Common & {
  to?: never
  href?: never
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}

type Props = AsLink | AsAnchor | AsButton

/**
 * Botón único del sistema. Se renderiza como `Link`, `a` o `button` según las
 * props, de modo que un enlace siempre es un enlace (navegable con teclado,
 * abrible en pestaña nueva) y una acción siempre es un botón.
 */
export function Button(props: Props) {
  const { children, variant = 'primary', size = 'md', full, arrow, className = '' } = props

  const classes = [
    'pm-btn',
    `pm-btn--${variant}`,
    size === 'sm' ? 'pm-btn--sm' : '',
    full ? 'pm-btn--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const inner = (
    <>
      <span className="pm-btn__label">{children}</span>
      {arrow && <Icon name="arrow" size={16} className="pm-btn__arrow" />}
    </>
  )

  if ('to' in props && props.to) {
    return (
      <Link className={classes} to={props.to}>
        {inner}
      </Link>
    )
  }

  if ('href' in props && props.href) {
    const external = props.href.startsWith('http')
    return (
      <a
        className={classes}
        href={props.href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {inner}
      </a>
    )
  }

  return (
    <button
      className={classes}
      type={props.type ?? 'button'}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {inner}
    </button>
  )
}
