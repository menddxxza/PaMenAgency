import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/citas', label: 'Citas' },
  { to: '/conversaciones', label: 'Conversaciones' },
  { to: '/estadisticas', label: 'Estadísticas' },
  { to: '/configuracion', label: 'Configuración' },
]

export function Shell() {
  const { signOut } = useAuth()
  const { memberships, activeBusinessId, setActiveBusinessId } = useTenant()

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar__brand">Atiende</div>

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
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="sidebar__link">
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="sidebar__signout" onClick={() => signOut()}>
          Cerrar sesión
        </button>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
