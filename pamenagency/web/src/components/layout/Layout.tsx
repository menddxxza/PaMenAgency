import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { CookieBanner } from '@/components/cookies/CookieBanner'
import { AssistantWidget } from '@/components/chat/AssistantWidget'
import { capturarUtm } from '@/lib/utm'

/** Cada pestaña empieza arriba, salvo que se navegue a un ancla. */
function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])

  return null
}

/** Cambio de pestaña: la nueva entra con un fundido corto. */
function PageFade({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="pm-pagefade">
      {children}
    </div>
  )
}

/**
 * Esqueleto común de todas las pestañas.
 *
 * Sin cursor propio, sin partículas, sin scroll suavizado ni secciones
 * ancladas: el desplazamiento es el normal del navegador y lo único que
 * se anima al bajar es la entrada de cada bloque.
 */
export function Layout() {
  // Solo lee la URL de entrada, no la de cada navegación interna — captura
  // el origen de la visita, no de cada clic dentro del sitio.
  useEffect(() => {
    capturarUtm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <a className="pm-skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <ScrollToTop />
      {/* Terciopelo: brillos y pliegues fijos detrás de todo el contenido. */}
      <div className="pt-velvet" aria-hidden="true" />
      <Header />
      <main id="contenido" tabIndex={-1}>
        <Suspense fallback={<div style={{ minHeight: '70svh' }} aria-busy="true" />}>
          <PageFade>
            <Outlet />
          </PageFade>
        </Suspense>
      </main>
      <Footer />
      <CookieBanner />
      <AssistantWidget />
    </>
  )
}
