import { useMemo, useState } from 'react'
import { useAppointments } from '@/hooks/useAppointments'
import { useClients } from '@/hooks/useClients'
import { useServices } from '@/hooks/useServices'
import { useToast } from '@/context/ToastContext'
import { usePageTitle } from '@/hooks/usePageTitle'
import { updateAppointmentStatus } from '@/lib/mutations'
import { NewAppointmentModal } from '@/components/citas/NewAppointmentModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonRows } from '@/components/ui/Skeleton'
import { IconCitas } from '@/components/layout/NavIcons'
import type { AppointmentStatus } from '@/types/database.types'

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistió',
}

export function Citas() {
  usePageTitle('Citas')
  const { appointments, loading } = useAppointments()
  const { clients, refresh: refreshClients } = useClients()
  const { services } = useServices()
  const { showToast } = useToast()
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all')
  const [showNewModal, setShowNewModal] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [toCancel, setToCancel] = useState<string | null>(null)

  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients])
  const serviceById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services])

  const filtered = appointments.filter((a) => statusFilter === 'all' || a.status === statusFilter)

  // Antes esto era un `await` suelto: si RLS o la red rechazaban el cambio,
  // el botón no hacía nada y el usuario no sabía si había funcionado.
  async function handleStatusChange(id: string, status: AppointmentStatus) {
    setPendingId(id)
    try {
      await updateAppointmentStatus(id, status)
      showToast(`Cita marcada como "${STATUS_LABEL[status].toLowerCase()}"`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo cambiar el estado de la cita', 'error')
    } finally {
      setPendingId(null)
    }
  }

  const cancelTarget = toCancel ? appointments.find((a) => a.id === toCancel) : null
  const cancelClientName = cancelTarget?.client_id
    ? clientById.get(cancelTarget.client_id)?.name || clientById.get(cancelTarget.client_id)?.phone
    : null

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
          <label className="sr-only" htmlFor="status-filter">
            Filtrar por estado
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
          >
            <option value="all">Todos los estados</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {statusFilter !== 'all' && (
            <button className="btn btn--ghost btn--sm" onClick={() => setStatusFilter('all')}>
              Quitar filtro
            </button>
          )}
        </div>

        {loading && <SkeletonRows rows={6} />}

        {!loading && filtered.length === 0 && appointments.length === 0 && (
          <EmptyState
            icon={<IconCitas />}
            title="Todavía no hay ninguna cita"
            description="Las citas que reserve el bot por WhatsApp entran aquí solas. También puedes crear una a mano ahora mismo."
            action={
              <button className="btn btn--primary" onClick={() => setShowNewModal(true)}>
                + Nueva cita
              </button>
            }
          />
        )}

        {!loading && filtered.length === 0 && appointments.length > 0 && (
          <EmptyState
            icon={<IconCitas />}
            title={`Ninguna cita en estado "${STATUS_LABEL[statusFilter as AppointmentStatus]}"`}
            description="Prueba con otro estado o quita el filtro para ver la agenda completa."
            action={
              <button className="btn btn--sm" onClick={() => setStatusFilter('all')}>
                Ver todas
              </button>
            }
          />
        )}

        {!loading && filtered.length > 0 && (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Origen</th>
                  <th>Estado</th>
                  <th><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const client = a.client_id ? clientById.get(a.client_id) : null
                  const service = a.service_id ? serviceById.get(a.service_id) : null
                  const busy = pendingId === a.id
                  return (
                    <tr key={a.id} className={busy ? 'is-busy' : ''}>
                      <td className="table__nowrap">
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
                          {a.status !== 'confirmed' && a.status !== 'completed' && a.status !== 'cancelled' && (
                            <button
                              className="btn btn--sm"
                              disabled={busy}
                              onClick={() => handleStatusChange(a.id, 'confirmed')}
                            >
                              Confirmar
                            </button>
                          )}
                          {a.status !== 'completed' && a.status !== 'cancelled' && (
                            <button
                              className="btn btn--sm"
                              disabled={busy}
                              onClick={() => handleStatusChange(a.id, 'completed')}
                            >
                              Completar
                            </button>
                          )}
                          {a.status !== 'cancelled' && a.status !== 'completed' && (
                            <button
                              className="btn btn--sm btn--danger"
                              disabled={busy}
                              onClick={() => setToCancel(a.id)}
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
          </div>
        )}
      </div>

      {showNewModal && (
        <NewAppointmentModal onClose={() => setShowNewModal(false)} onCreated={refreshClients} />
      )}

      {toCancel && (
        <ConfirmDialog
          title="Cancelar esta cita"
          message={
            cancelClientName
              ? `Se marcará como cancelada la cita de ${cancelClientName}. Avísale tú si procede: Atiende no envía ningún mensaje al cancelar.`
              : 'La cita se marcará como cancelada. Esta acción no envía ningún aviso al cliente.'
          }
          confirmLabel="Sí, cancelar la cita"
          danger
          onCancel={() => setToCancel(null)}
          onConfirm={async () => {
            await handleStatusChange(toCancel, 'cancelled')
            setToCancel(null)
          }}
        />
      )}
    </div>
  )
}
