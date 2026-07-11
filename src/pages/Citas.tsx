import { useMemo, useState } from 'react'
import { useAppointments } from '@/hooks/useAppointments'
import { useClients } from '@/hooks/useClients'
import { useServices } from '@/hooks/useServices'
import { updateAppointmentStatus } from '@/lib/mutations'
import { NewAppointmentModal } from '@/components/citas/NewAppointmentModal'
import type { AppointmentStatus } from '@/types/database.types'

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistió',
}

export function Citas() {
  const { appointments, loading } = useAppointments()
  const { clients, refresh: refreshClients } = useClients()
  const { services } = useServices()
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all')
  const [showNewModal, setShowNewModal] = useState(false)

  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients])
  const serviceById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services])

  const filtered = appointments.filter((a) => statusFilter === 'all' || a.status === statusFilter)

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    await updateAppointmentStatus(id, status)
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1>Citas</h1>
          <p>Agenda de citas del negocio, reservadas por el bot o manualmente.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowNewModal(true)}>
          + Nueva cita
        </button>
      </div>

      <div className="card">
        <div className="filter-row">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}>
            <option value="all">Todos los estados</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {loading && <p className="empty-state">Cargando…</p>}

        {!loading && filtered.length === 0 && (
          <p className="empty-state">No hay citas {statusFilter !== 'all' ? `en estado "${STATUS_LABEL[statusFilter]}"` : 'todavía'}.</p>
        )}

        {!loading && filtered.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Origen</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const client = a.client_id ? clientById.get(a.client_id) : null
                const service = a.service_id ? serviceById.get(a.service_id) : null
                return (
                  <tr key={a.id}>
                    <td>
                      {new Date(a.starts_at).toLocaleString('es-ES', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td>{client?.name || client?.phone || '—'}</td>
                    <td>{service?.name ?? '—'}</td>
                    <td>{a.source === 'bot' ? 'Bot' : 'Manual'}</td>
                    <td>
                      <span className={`badge badge--${a.status}`}>{STATUS_LABEL[a.status]}</span>
                    </td>
                    <td>
                      <div className="table__actions">
                        {a.status !== 'confirmed' && a.status !== 'completed' && (
                          <button className="btn btn--sm" onClick={() => handleStatusChange(a.id, 'confirmed')}>
                            Confirmar
                          </button>
                        )}
                        {a.status !== 'completed' && a.status !== 'cancelled' && (
                          <button className="btn btn--sm" onClick={() => handleStatusChange(a.id, 'completed')}>
                            Completar
                          </button>
                        )}
                        {a.status !== 'cancelled' && a.status !== 'completed' && (
                          <button
                            className="btn btn--sm btn--danger"
                            onClick={() => handleStatusChange(a.id, 'cancelled')}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showNewModal && (
        <NewAppointmentModal onClose={() => setShowNewModal(false)} onCreated={refreshClients} />
      )}
    </div>
  )
}
