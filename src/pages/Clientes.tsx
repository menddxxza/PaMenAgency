import { useMemo, useState } from 'react'
import { useClients } from '@/hooks/useClients'
import { useAppointments } from '@/hooks/useAppointments'
import { useServices } from '@/hooks/useServices'
import { ClientDetailModal } from '@/components/clientes/ClientDetailModal'
import type { Database } from '@/types/database.types'

type Client = Database['public']['Tables']['clients']['Row']

export function Clientes() {
  const { clients, loading, refresh } = useClients()
  const { appointments } = useAppointments()
  const { services } = useServices()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Client | null>(null)

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
      </div>

      <div className="card">
        <div className="filter-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o teléfono…"
            style={{ minWidth: '240px' }}
          />
        </div>

        {loading && <p className="empty-state">Cargando…</p>}
        {!loading && filtered.length === 0 && <p className="empty-state">Sin clientes que coincidan.</p>}

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
    </div>
  )
}
