import { useAppointments } from '@/hooks/useAppointments'
import { useConversations } from '@/hooks/useConversations'

export function Dashboard() {
  const { appointments } = useAppointments()
  const { conversations } = useConversations()

  const upcoming = appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed')
  const openConversations = conversations.filter((c) => c.status === 'open')

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-card__value">{upcoming.length}</span>
          <span className="stat-card__label">Próximas citas</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{openConversations.length}</span>
          <span className="stat-card__label">Conversaciones abiertas</span>
        </div>
      </div>
    </div>
  )
}
