import { useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { mainNav } from '@/content/site'
import { Button } from '@/components/ui/Button'
import OptionWheel from '@/components/ui/OptionWheel'

/**
 * Menú a pantalla completa. Mantiene el foco dentro mientras está abierto y
 * se cierra con Escape, como espera cualquier usuario de teclado.
 *
 * La navegación es una rueda (OptionWheel) en vez de una lista plana: se
 * arrastra o se recorre con las flechas para mirar las secciones, y un
 * tap/clic o Enter sobre una opción es lo único que navega — arrastrar
 * nunca navega a mitad de gesto.
 */
export function MobileMenu({ onClose, email }: { onClose: () => void; email: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  const defaultSelected = useMemo(() => {
    const i = mainNav.findIndex((item) =>
      item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to),
    )
    return i >= 0 ? i : 0
  }, [location.pathname])

  const items = useMemo(
    () =>
      mainNav.map((item, i) => (
        <span className="pm-mobilemenu__wheel-item">
          <span className="pm-mobilemenu__wheel-index" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          {item.label}
        </span>
      )),
    [],
  )

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('a, button, [role="listbox"]')?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const focusables = ref.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [role="listbox"]',
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
      <div className="pm-mobilemenu__wheel">
        <OptionWheel
          items={items}
          defaultSelected={defaultSelected}
          onItemActivate={(index) => navigate(mainNav[index].to)}
          textColor="#F4F4F2"
          activeColor="#D4AF37"
          side="left"
          fontSize={1.85}
          spacing={1.15}
          curve={0.5}
          tilt={4}
          blur={1}
          fade={0.13}
          minOpacity={0.35}
          smoothing={180}
          inset={8}
          ariaLabel="Navegación principal"
        />
      </div>

      <div className="pm-mobilemenu__footer">
        <Button to="/diagnostico" variant="ghost" full>
          Descubrir mi potencial
        </Button>
        <Button to="/contacto" full arrow>
          Hablar con PAMEN AGENCY
        </Button>
        <a className="pm-link" href={`mailto:${email}`} style={{ justifyContent: 'center' }}>
          {email}
        </a>
      </div>
    </div>
  )
}
