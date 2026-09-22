import { useEffect, useState, type ComponentType } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { useSubscription } from '@/hooks/useSubscription'
import { PLANS } from '@/lib/plans'
import { TrialBanner } from '@/components/layout/TrialBanner'
import {
  IconCitas,
  IconClientes,
  IconConfiguracion,
  IconConversaciones,
  IconDashboard,
  IconEstadisticas,
  IconFacturacion,
  IconInventario,
} from '@/components/layout/NavIcons'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
}

export function Shell() {
  const { session, signOut } = useAuth()
  const { memberships, activeBusinessId, setActiveBusinessId } = useTenant()
  const { subscription, isTrialing } = useSubscription()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const plan = PLANS[subscription?.plan ?? 'starter']

  // Agrupado por para qué se usa: el día a día arriba, la administración
  // debajo. Con ocho entradas sueltas costaba encontrar nada.
  const dailyItems: NavItem[] = [
    { to: '/app', label: 'Dashboard', icon: IconDashboard, end: true },
    { to: '/app/citas', label: 'Citas', icon: IconCitas },
    { to: '/app/conversaciones', label: 'Conversaciones', icon: IconConversaciones },
    ...(plan.hasClientes ? [{ to: '/app/clientes', label: 'Clientes', icon: IconClientes }] : []),
  ]

  const manageItems: NavItem[] = [
    ...(plan.hasFacturacion ? [{ to: '/app/facturacion', label: 'Facturación', icon: IconFacturacion }] : []),
    ...(plan.hasInventario ? [{ to: '/app/inventario', label: 'Inventario', icon: IconInventario }] : []),
    ...(plan.hasEstadisticas ? [{ to: '/app/estadisticas', label: 'Estadísticas', icon: IconEstadisticas }] : []),
    { to: '/app/configuracion', label: 'Configuración', icon: IconConfiguracion },
  ]

  // Cierra el drawer al navegar (móvil) — evita que quede abierto tapando
  // la página nueva tras tocar un link.
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Escape cierra el menú móvil: era la única capa a pantalla completa de la
  // app de la que no se podía salir con el teclado.
  useEffect(() => {
    if (!sidebarOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen])

  function renderLink(item: NavItem) {
    const Icon = item.icon
    return (
      <NavLink key={item.to} to={item.to} end={item.end} className="sidebar__link">
        <Icon />
        {item.label}
      </NavLink>
    )
  }

  return (
    <div className="shell">
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>

      <header className="mobile-topbar">
        <button
          className="mobile-topbar__menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={sidebarOpen}
        >
          ☰
        </button>
        <span className="mobile-topbar__brand">Atiende</span>
      </header>

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`} aria-label="Menú principal">
        <div className="sidebar__brand-row">
          <div className="sidebar__brand">Atiende</div>
          <button className="sidebar__close-btn" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú">
            ✕
          </button>
        </div>

        <span className={`plan-chip ${isTrialing ? 'plan-chip--trial' : ''}`}>
          {isTrialing ? `Prueba · ${plan.name}` : `Plan ${plan.name}`}
        </span>

        {memberships.length > 1 && (
          <label className="sr-only" htmlFor="business-switcher">
            Negocio activo
          </label>
        )}
        {memberships.length > 1 && (
          <select
            id="business-switcher"
            className="business-switcher"
            value={activeBusinessId ?? ''}
            onChange={(e) => setActiveBusinessId(e.target.value)}
          >
            {memberships.map((m) => (
              <option key={m.businessId} value={m.businessId}>
                {m.businessName}
              </option>
            ))}
          </select>
        )}

        <nav className="sidebar__nav">
          {dailyItems.map(renderLink)}
          <span className="sidebar__section-label">Gestión</span>
          {manageItems.map(renderLink)}
        </nav>

        <div className="sidebar__footer">
          <span className="sidebar__user" title={session?.user.email}>
            {session?.user.email}
          </span>
          <button className="btn btn--ghost btn--sm" onClick={() => signOut()}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="content" id="contenido">
        <TrialBanner />
        <Outlet />
      </main>
    </div>
  )
}
