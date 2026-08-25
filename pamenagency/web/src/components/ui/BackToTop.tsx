import { useEffect, useState } from 'react'
import { Icon } from './Icon'

const SHOW_AFTER_PX = 480

/** Aparece tras bajar lo suficiente en la página; lleva de vuelta arriba con scroll suave. */
export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      className="pm-backtotop"
      data-visible={visible}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <Icon name="arrow" className="pm-backtotop__icon" />
    </button>
  )
}
