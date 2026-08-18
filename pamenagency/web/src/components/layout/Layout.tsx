import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { CookieBanner } from '@/components/cookies/CookieBanner'
import { CustomCursor } from '@/components/ui/CustomCursor'
import { AmbientParticles } from '@/components/ui/AmbientParticles'
import { AssistantWidget } from '@/components/chat/AssistantWidget'

/** Cada navegación empieza arriba, salvo que se navegue a un ancla. */
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

/** Transición breve entre páginas; se anula con movimiento reducido. */
function PageFade({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="pm-pagefade">
      {children}
    </div>
  )
}

export function Layout() {
  return (
    <>
      <a className="pm-skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <ScrollToTop />
      <CustomCursor />
      <AmbientParticles />
      <div className="pm-noise" aria-hidden="true" />
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
