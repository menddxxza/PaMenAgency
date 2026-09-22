import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'

interface Props {
  title: string
  updatedAt: string
  children: ReactNode
}

// Envoltorio único para las tres páginas legales (privacidad, cookies,
// términos): mismo ancho de lectura, misma cabecera con fecha de última
// actualización y el mismo enlace de vuelta, para no repetirlo tres veces.
export function LegalLayout({ title, updatedAt, children }: Props) {
  usePageTitle(title)

  return (
    <div className="legal-page">
      <div className="legal-page__inner">
        <Link to="/" className="legal-page__back">
          ← Volver a Atiende
        </Link>
        <h1>{title}</h1>
        <p className="legal-page__updated">Última actualización: {updatedAt}</p>
        <div className="legal-page__body">{children}</div>
      </div>
    </div>
  )
}
