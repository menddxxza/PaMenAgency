import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from './Button'

const SHOW_AFTER_PX = 560

/** Rutas donde el CTA sería redundante: ya son el propio destino. */
const OCULTAR_EN = ['/auditoria-ia', '/contacto']

/**
 * Barra fija de contacto, sólo en móvil y tablet.
 *
 * Por debajo de 1240px el botón "Auditoría" del header desaparece (ver el
 * corte en components.css): ahí es donde la mayoría del tráfico entra hoy,
 * y se queda sin un CTA siempre visible mientras se hace scroll. Esto
 * rellena ese hueco, no añade uno nuevo.
 *
 * Mientras está visible, marca <body> para que el botón de volver arriba y
 * el lanzador del asistente suban por encima suyo en vez de quedar tapados
 * — la coordinación vive en CSS (ver `pm-has-stickycta`), no aquí.
 */
export function StickyCta() {
  const [visible, setVisible] = useState(false)
  const { pathname } = useLocation()
  const oculta = OCULTAR_EN.includes(pathname)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (oculta) {
      setVisible(false)
      return
    }
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [oculta])

  useEffect(() => {
    document.body.classList.toggle('pm-has-stickycta', visible)
    return () => document.body.classList.remove('pm-has-stickycta')
  }, [visible])

  // La altura real de la barra se mide, no se adivina: en un iPhone con
  // indicador de inicio, el margen de seguridad (env(safe-area-inset-bottom))
  // la hace más alta de lo que cualquier número fijo habría previsto — fue
  // justo lo que chocaba con el botón de volver arriba y el asistente. El
  // botón de volver arriba y el asistente leen esta misma variable en CSS.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const medir = () => {
      document.documentElement.style.setProperty(
        '--stickycta-h',
        visible ? `${el.getBoundingClientRect().height}px` : '0px',
      )
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    window.addEventListener('resize', medir)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', medir)
    }
  }, [visible])

  if (oculta) return null

  return (
    // visibility (no sólo opacity) es lo que saca el enlace del orden de
    // tabulación mientras está oculto — Button no acepta tabIndex porque
    // envuelve un <Link>, así que el corte tiene que venir del CSS.
    <div className="pm-stickycta" ref={ref} data-visible={visible} aria-hidden={!visible}>
      <Button to="/auditoria-ia" full arrow>
        Pedir auditoría de IA
      </Button>
    </div>
  )
}
