import { Link } from 'react-router-dom'
import { site } from '@/content/site'

/**
 * Logotipo de PaMenAgency.
 *
 * Logo definitivo en uso: `public/logo.jpg`, recortado al círculo (sin el
 * margen negro sobrante del archivo original) y reutilizado también como
 * favicon (`public/favicon.png`, generado a partir del mismo recorte).
 *
 * Para sustituirlo por una versión nueva: coloca el archivo en `public/`,
 * cambia `LOGO_SRC` a esa ruta y ajusta `LOGO_ASPECT` (ancho ÷ alto) si no
 * es igual de proporción. El hueco reservado y los tamaños de cabecera y
 * pie ya están definidos aquí, así que el logo no se deformará ni
 * desplazará el resto del diseño.
 */
const LOGO_SRC: string | null = '/logo.jpg'
const LOGO_ASPECT = 507 / 485

type Props = {
  /** `nav` en la cabecera, `footer` en el pie, `mark` sólo el símbolo. */
  variant?: 'nav' | 'footer' | 'mark'
  /** Alto del símbolo en píxeles. */
  size?: number
  /** Envuelve el logo en un enlace a la portada. */
  asLink?: boolean
}

function Mark({ size }: { size: number }) {
  if (LOGO_SRC) {
    return (
      <img
        src={LOGO_SRC}
        alt=""
        width={size * LOGO_ASPECT}
        height={size}
        style={{ height: size, width: 'auto', objectFit: 'contain' }}
      />
    )
  }

  // Placeholder: monograma geométrico. Un rombo hueco con una barra interior,
  // que evoca la P de PaMen sin pretender ser el logotipo definitivo.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ flex: 'none', display: 'block' }}
    >
      <defs>
        <linearGradient id="pm-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0D680" />
          <stop offset="55%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8A6F1E" />
        </linearGradient>
      </defs>
      <rect
        x="6.5"
        y="6.5"
        width="27"
        height="27"
        rx="6"
        transform="rotate(45 20 20)"
        stroke="url(#pm-logo-grad)"
        strokeWidth="1.6"
      />
      <path d="M15.5 26V14h6a4 4 0 0 1 0 8h-6" stroke="url(#pm-logo-grad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="20" r="1.6" fill="#D4AF37" />
    </svg>
  )
}

export function Logo({ variant = 'nav', size, asLink = true }: Props) {
  const markSize = size ?? (variant === 'footer' ? 40 : 32)

  const content = (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: variant === 'footer' ? '0.85rem' : '0.65rem',
        minWidth: 0,
      }}
    >
      <Mark size={markSize} />
      {variant !== 'mark' && (
        <span
          className="pm-wordmark"
          style={{
            fontSize: variant === 'footer' ? 'clamp(1.1rem, 2.4vw, 1.4rem)' : '1.02rem',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {site.wordmark.first}{' '}
          <span className="pm-wordmark__accent">{site.wordmark.second}</span>
        </span>
      )}
    </span>
  )

  if (!asLink) return content

  return (
    <Link to="/" aria-label={`${site.name} — ir a la portada`} style={{ display: 'inline-flex', minWidth: 0 }}>
      {content}
    </Link>
  )
}
