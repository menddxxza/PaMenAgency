import { useEffect, useRef, type FormEvent, type ReactNode } from 'react'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  /** Ancho reducido para confirmaciones. */
  variant?: 'form' | 'confirm'
  /**
   * Si se pasa, el cuerpo y el pie van dentro de un <form>: así el botón de
   * enviar sigue siendo submit y el Intro desde cualquier campo funciona.
   */
  onSubmit?: (e: FormEvent) => void
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Los diálogos se pueden anidar (la ficha de cliente abre la confirmación de
// borrar un documento). Sin esta pila, Escape cerraba los dos de golpe:
// ambos escuchan en `document`, así que stopPropagation no basta.
const modalStack: symbol[] = []

// Envoltorio único para todos los diálogos. Antes cada modal montaba su
// propio overlay sin rol ARIA, sin cierre por Escape y sin atrapar el foco:
// con el teclado se seguía tabulando por la página de detrás, y quien usa
// lector de pantalla no recibía aviso de que se había abierto nada.
export function Modal({ title, onClose, children, footer, variant = 'form', onSubmit }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null

    const token = Symbol('modal')
    modalStack.push(token)

    const dialog = dialogRef.current
    dialog?.querySelector<HTMLElement>(FOCUSABLE)?.focus()

    // El scroll del fondo moviéndose bajo el diálogo es especialmente
    // molesto en móvil, donde el modal ocupa casi toda la pantalla.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(e: KeyboardEvent) {
      // Solo responde el diálogo que está encima de todo.
      if (modalStack[modalStack.length - 1] !== token) return

      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialog) return

      const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusables.length === 0) return
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

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      const index = modalStack.indexOf(token)
      if (index !== -1) modalStack.splice(index, 1)
      // Solo el último en cerrarse devuelve el scroll a la página.
      if (modalStack.length === 0) document.body.style.overflow = previousOverflow
      previouslyFocused.current?.focus()
    }
  }, [onClose])

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`modal ${variant === 'confirm' ? 'modal--confirm' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={dialogRef}
      >
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {onSubmit ? (
          <form onSubmit={onSubmit} className="modal__form">
            <div className="modal__body">{children}</div>
            {footer && <div className="modal__footer">{footer}</div>}
          </form>
        ) : (
          <>
            <div className="modal__body">{children}</div>
            {footer && <div className="modal__footer">{footer}</div>}
          </>
        )}
      </div>
    </div>
  )
}
