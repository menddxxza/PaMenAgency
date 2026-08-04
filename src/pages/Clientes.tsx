import { useMemo, useState } from 'react'
import { useTenant } from '@/context/TenantContext'
import { useClients } from '@/hooks/useClients'
import { useAppointments } from '@/hooks/useAppointments'
import { useServices } from '@/hooks/useServices'
import { ClientDetailModal } from '@/components/clientes/ClientDetailModal'
import { NewClientModal } from '@/components/clientes/NewClientModal'
import { usePageTitle } from '@/hooks/usePageTitle'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonRows } from '@/components/ui/Skeleton'
import { IconClientes } from '@/components/layout/NavIcons'
import type { Database } from '@/types/database.types'

type Client = Database['public']['Tables']['clients']['Row']

export function Clientes() {
  usePageTitle('Clientes')
  const { activeBusinessId } = useTenant()
  const { clients, loading, refresh } = useClients()
  const { appointments } = useAppointments()
  const { services } = useServices()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Client | null>(null)
  const [showNew, setShowNew] = useState(false)

  const serviceById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services])
  const appointmentCountByClient = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of appointments) {
      if (!a.client_id) continue
      map.set(a.client_id, (map.get(a.client_id) ?? 0) + 1)
    }
    return map
  }, [appointments])

  const filtered = clients.filter((c) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (c.name ?? '').toLowerCase().includes(q) || c.phone.includes(q)
  })

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1>Clientes</h1>
          <p>Contactos que han escrito o reservado citas.</p>
        </div>
        {activeBusinessId && (
          <button className="btn btn--primary" onClick={() => setShowNew(true)}>
            + Nuevo cliente
          </button>
        )}
      </div>

      <div className="card">
        <div className="filter-row">
          <label className="sr-only" htmlFor="client-search">
            Buscar cliente
          </label>
          <input
            id="client-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o teléfono…"
            style={{ minWidth: '240px' }}
          />
          {query && (
            <span className="filter-row__count">
              {filtered.length} de {clients.length}
            </span>
          )}
        </div>

        {loading && <SkeletonRows rows={6} />}

        {!loading && clients.length === 0 && (
          <EmptyState
            icon={<IconClientes />}
            title="Aún no tienes clientes"
            description="Cada persona que escriba por WhatsApp o reserve una cita se da de alta aquí sola, con su historial y sus documentos. Si alguien llega por teléfono o en persona, también puedes añadirlo a mano."
            action={
              activeBusinessId && (
                <button className="btn btn--sm btn--primary" onClick={() => setShowNew(true)}>
                  + Nuevo cliente
                </button>
              )
            }
          />
        )}

        {!loading && clients.length > 0 && filtered.length === 0 && (
          <EmptyState
            icon={<IconClientes />}
            title="Ningún cliente coincide"
            description={`No hay resultados para "${query.trim()}". Prueba con parte del nombre o con los últimos dígitos del teléfono.`}
            action={
              <button className="btn btn--sm" onClick={() => setQuery('')}>
                Limpiar búsqueda
              </button>
            }
          />
        )}

        {!loading && filtered.length > 0 && (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Citas</th>
                  <th>Cliente desde</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name || '—'}</td>
                    <td>{c.phone}</td>
                    <td>{appointmentCountByClient.get(c.id) ?? 0}</td>
                    <td>{new Date(c.created_at).toLocaleDateString('es-ES')}</td>
                    <td>
                      <div className="table__actions">
                        <button className="btn btn--sm" onClick={() => setSelected(c)}>
                          Ver ficha
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <ClientDetailModal
          client={selected}
          appointments={appointments}
          serviceById={serviceById}
          onClose={() => setSelected(null)}
          onSaved={refresh}
        />
      )}
      {showNew && activeBusinessId && (
        <NewClientModal businessId={activeBusinessId} onClose={() => setShowNew(false)} onCreated={refresh} />
      )}
    </div>
  )
}
