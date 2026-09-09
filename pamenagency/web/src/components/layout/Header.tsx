import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { mainNav, site, type NavItem } from '@/content/site'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import { SearchOverlay } from './SearchOverlay'

const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  /** Etiqueta del grupo desplegado, o null. Sólo uno a la vez. */
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const location = useLocation()

  /** Un grupo se marca como activo si la ruta actual es la de alguno de sus hijos. */
  const isGroupActive = (item: NavItem) =>
    (item.children ?? []).some((c) =>
      c.to === '/' ? location.pathname === '/' : location.pathname.startsWith(c.to),
    )

  // Escape cierra el desplegable y devuelve el foco al botón que lo abrió;
  // un clic fuera lo cierra sin más.
  useEffect(() => {
    if (!openGroup) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const trigger = navRef.current?.querySelector<HTMLButtonElement>(
        '.pm-navgroup[data-open="true"] .pm-navgroup__trigger',
      )
      setOpenGroup(null)
      trigger?.focus()
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenGroup(null)
    }
    // Si el foco sale del menú por teclado, el desplegable ya no pinta nada
    // abierto.
    const onFocusIn = (e: FocusEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenGroup(null)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('focusin', onFocusIn)
    }
  }, [openGroup])

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

  // Cambiar de página cierra el menú, el buscador y cualquier desplegable.
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
    setOpenGroup(null)
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

          <nav className="pm-header__nav" aria-label="Navegación principal" ref={navRef}>
            {mainNav.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className="pm-navgroup"
                  data-open={openGroup === item.label}
                  // En escritorio con ratón el grupo se abre al pasar por
                  // encima; el clic y el teclado siguen funcionando igual
                  // para quien no usa puntero.
                  onMouseEnter={() => setOpenGroup(item.label)}
                  onMouseLeave={() => setOpenGroup(null)}
                >
                  <button
                    type="button"
                    className="pm-navlink pm-navgroup__trigger"
                    aria-expanded={openGroup === item.label}
                    aria-controls={`pm-navgroup-${slugify(item.label)}`}
                    data-active={isGroupActive(item)}
                    // El clic sólo abre, nunca cierra: con el ratón encima
                    // el grupo ya está abierto por hover, y hacer que el
                    // clic alternase lo cerraba justo cuando el usuario
                    // acababa de ir a por él. Para cerrar están Escape,
                    // salir con el ratón, clicar fuera y cambiar de página.
                    onClick={() => setOpenGroup(item.label)}
                  >
                    {item.label}
                    <Icon name="chevron" size={14} className="pm-navgroup__caret" />
                  </button>

                  <div
                    id={`pm-navgroup-${slugify(item.label)}`}
                    className="pm-navgroup__panel"
                    hidden={openGroup !== item.label}
                  >
                    <ul>
                      {item.children.map((child) => (
                        <li key={child.to + child.label}>
                          <NavLink to={child.to} className="pm-navgroup__link" end={child.to === '/'}>
                            <span>{child.label}</span>
                            {child.hint && <span className="pm-navgroup__hint">{child.hint}</span>}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to!}
                  className="pm-navlink"
                  end={item.to === '/'}
                >
                  {item.label}
                </NavLink>
              ),
            )}
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
              {/* El CTA global del sitio es la auditoría, no un contacto genérico.
                  Ojo al ancho de la etiqueta: el corte a 1240px del header está
                  calibrado justo para el logo + 7 enlaces + búsqueda + este botón
                  (ver el comentario del breakpoint en components.css). */}
              <Button to="/auditoria-ia" size="sm" arrow>
                Auditoría
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
