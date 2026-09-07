import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { mainNav, site } from '@/content/site'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import { SearchOverlay } from './SearchOverlay'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()

  // Ctrl/Cmd+K abre el buscador desde cualquier página, como en la mayoría
  // de sitios que tienen uno.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cambiar de página cierra el menú y el buscador.
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  // Con el menú o el buscador abiertos, la página de detrás no debe poder
  // desplazarse.
  useEffect(() => {
    if (!menuOpen && !searchOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [menuOpen, searchOpen])

  const closeMenu = () => {
    setMenuOpen(false)
    // El foco vuelve al botón que abrió el menú.
    burgerRef.current?.focus()
  }

  return (
    <>
      <header className="pm-header" data-scrolled={scrolled}>
        <div className="pm-header__inner">
          <Logo variant="nav" />

          <nav className="pm-header__nav" aria-label="Navegación principal">
            {mainNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="pm-navlink"
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="pm-header__actions">
            <button
              type="button"
              className="pm-header__iconbtn"
              aria-label="Buscar en el sitio (Ctrl+K)"
              onClick={() => setSearchOpen(true)}
            >
              <Icon name="search" size={18} />
            </button>
            <div className="pm-header__cta">
              <Button to="/contacto" size="sm" arrow>
                Hablemos
              </Button>
            </div>
            <button
              ref={burgerRef}
              type="button"
              className="pm-burger"
              aria-expanded={menuOpen}
              aria-controls="pm-mobile-menu"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="pm-burger__lines" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && <MobileMenu onClose={closeMenu} email={site.email} />}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  )
}
