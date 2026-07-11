import { useMemo } from 'react'
import { useAppointments } from '@/hooks/useAppointments'
import { useConversations } from '@/hooks/useConversations'
import { useClients } from '@/hooks/useClients'

export function Dashboard() {
  const { appointments } = useAppointments()
  const { conversations } = useConversations()
  const { clients } = useClients()

  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients])

  const upcoming = appointments
    .filter((a) => (a.status === 'pending' || a.status === 'confirmed') && new Date(a.starts_at) >= new Date())
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .slice(0, 5)

  const openConversations = conversations.filter((c) => c.status === 'open').slice(0, 5)
  const pendingCount = appointments.filter((a) => a.status === 'pending').length

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-card__value">{upcoming.length}</span>
          <span className="stat-card__label">Próximas citas</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{pendingCount}</span>
          <span className="stat-card__label">Citas por confirmar</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{openConversations.length}</span>
          <span className="stat-card__label">Conversaciones abiertas</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{clients.length}</span>
          <span className="stat-card__label">Clientes</span>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card__title">Próximas citas</div>
          {upcoming.length === 0 && <p className="empty-state">No hay citas próximas.</p>}
          {upcoming.length > 0 && (
            <div className="mini-list">
              {upcoming.map((a) => {
                const client = a.client_id ? clientById.get(a.client_id) : null
                return (
                  <div className="mini-list__item" key={a.id}>
                    <span>{client?.name || client?.phone || 'Cliente'}</span>
                    <span>
                      {new Date(a.starts_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card__title">Conversaciones abiertas</div>
          {openConversations.length === 0 && <p className="empty-state">No hay conversaciones abiertas.</p>}
          {openConversations.length > 0 && (
            <div className="mini-list">
              {openConversations.map((c) => {
                const client = clientById.get(c.client_id)
                return (
                  <div className="mini-list__item" key={c.id}>
                    <span>{client?.name || client?.phone || 'Cliente'}</span>
                    <span>{new Date(c.last_message_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
