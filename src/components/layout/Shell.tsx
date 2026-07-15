import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { useSubscription } from '@/hooks/useSubscription'
import { PLANS } from '@/lib/plans'

export function Shell() {
  const { session, signOut } = useAuth()
  const { memberships, activeBusinessId, setActiveBusinessId } = useTenant()
  const { subscription } = useSubscription()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const plan = PLANS[subscription?.plan ?? 'starter']
  const navItems = [
    { to: '/app', label: 'Dashboard', end: true },
    { to: '/app/citas', label: 'Citas' },
    ...(plan.hasClientes ? [{ to: '/app/clientes', label: 'Clientes' }] : []),
    { to: '/app/conversaciones', label: 'Conversaciones' },
    ...(plan.hasFacturacion ? [{ to: '/app/facturacion', label: 'Facturación' }] : []),
    ...(plan.hasInventario ? [{ to: '/app/inventario', label: 'Inventario' }] : []),
    ...(plan.hasEstadisticas ? [{ to: '/app/estadisticas', label: 'Estadísticas' }] : []),
    { to: '/app/configuracion', label: 'Configuración' },
  ]

  // Cierra el drawer al navegar (móvil) — evita que quede abierto tapando
  // la página nueva tras tocar un link.
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="shell">
      <header className="mobile-topbar">
        <button
          className="mobile-topbar__menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          ☰
        </button>
        <span className="mobile-topbar__brand">Atiende</span>
      </header>

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="sidebar__brand-row">
          <div className="sidebar__brand">Atiende</div>
          <button className="sidebar__close-btn" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú">
            ✕
          </button>
        </div>

        {memberships.length > 1 && (
          <select
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
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="sidebar__link">
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <span className="sidebar__user">{session?.user.email}</span>
          <button className="btn btn--ghost btn--sm" onClick={() => signOut()}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
