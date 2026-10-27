import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { site, tabs } from '@/content/site'
import { Logo } from './Logo'

/**
 * Cabecera: logotipo, botón de contacto y el menú de las tres barras.
 *
 * El menú es el único sitio desde el que se navega entre pestañas, en
 * cualquier tamaño de pantalla. Al abrirse, las tres barras se funden en
 * la barra diagonal del monograma P/M, que es el sello de la web.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cambiar de pestaña cierra el menú.
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Con el menú abierto: la página de detrás no se desplaza, Escape cierra,
  // el foco entra en el menú y no se escapa de él con el tabulador.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const menu = menuRef.current
    const focusables = () =>
      [
        burgerRef.current,
        ...Array.from(menu?.querySelectorAll<HTMLElement>('a[href], button') ?? []),
      ].filter(Boolean) as HTMLElement[]

    // La pestaña actual recibe el foco: es el punto de partida natural.
    const actual = menu?.querySelector<HTMLElement>('[aria-current="page"]')
    ;(actual ?? menu?.querySelector<HTMLElement>('a[href]'))?.focus({ preventScroll: true })

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        burgerRef.current?.focus()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // Cerrar a propósito (botón de abajo): el foco vuelve a las tres barras.
  const cerrar = () => {
    setOpen(false)
    burgerRef.current?.focus()
  }

  return (
    <>
      <header className="pt-header" data-scrolled={scrolled} data-menu={open ? 'open' : 'closed'}>
        <div className="pt-header__inner">
          <Logo variant="nav" />

          <div className="pt-header__actions">
            <Link className="pt-header__cta" to="/contacto" tabIndex={open ? -1 : undefined}>
              Hablemos
            </Link>
            <button
              ref={burgerRef}
              type="button"
              className="pt-burger"
              aria-expanded={open}
              aria-controls="pt-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="pt-burger__bars" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="pt-burger__label">{open ? 'Cerrar' : 'Menú'}</span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="pt-menu"
        ref={menuRef}
        className="pt-menu"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de la web"
      >
        <div className="pt-menu__inner">
          <nav aria-label="Pestañas">
            <ol className="pt-menu__list">
              {tabs.map((tab, i) => (
                <li key={tab.to} style={{ '--i': i } as React.CSSProperties}>
                  <NavLink to={tab.to} end={tab.to === '/'} className="pt-menu__link">
                    <span className="pt-menu__slash" aria-hidden="true" />
                    <span className="pt-menu__label">{tab.label}</span>
                    <span className="pt-menu__hint">{tab.hint}</span>
                  </NavLink>
                </li>
              ))}
            </ol>
          </nav>

          {/* Salida a mano del pulgar: en el móvil el botón de arriba queda lejos */}
          <button type="button" className="pt-menu__cerrar" onClick={cerrar}>
            Cerrar menú <span aria-hidden="true">✕</span>
          </button>

          <div className="pt-menu__foot">
            <a href={`mailto:${site.email}`}>{site.email}</a>
            {site.phone && <a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a>}
            {site.social.map((s) =>
              s.url ? (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </>
  )
}
