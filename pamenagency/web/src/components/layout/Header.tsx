import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { mainNav, site } from '@/content/site'
import { Button } from '@/components/ui/Button'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cambiar de página cierra el menú.
  useEffect(() => setMenuOpen(false), [location.pathname])

  // Con el menú abierto, la página de detrás no debe poder desplazarse.
  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [menuOpen])

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
    </>
  )
}
