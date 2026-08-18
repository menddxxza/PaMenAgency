import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { mainNav } from '@/content/site'
import { Button } from '@/components/ui/Button'

/**
 * Menú a pantalla completa. Mantiene el foco dentro mientras está abierto y
 * se cierra con Escape, como espera cualquier usuario de teclado.
 */
export function MobileMenu({ onClose, email }: { onClose: () => void; email: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('a, button')?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const focusables = ref.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (!focusables?.length) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      id="pm-mobile-menu"
      className="pm-mobilemenu"
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
    >
      <nav>
        <ul className="pm-mobilemenu__list">
          {mainNav.map((item, i) => (
            <li
              key={item.to}
              className="pm-mobilemenu__item"
              style={{ '--i': i } as React.CSSProperties}
            >
              <NavLink to={item.to} className="pm-mobilemenu__link" end={item.to === '/'}>
                <span className="pm-mobilemenu__index" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pm-mobilemenu__footer">
        <Button to="/diagnostico" variant="ghost" full>
          Descubrir mi potencial
        </Button>
        <Button to="/contacto" full arrow>
          Hablar con PA MEN AGENCY
        </Button>
        <a className="pm-link" href={`mailto:${email}`} style={{ justifyContent: 'center' }}>
          {email}
        </a>
      </div>
    </div>
  )
}
