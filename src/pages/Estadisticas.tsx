import { useMemo } from 'react'
import { useAppointments } from '@/hooks/useAppointments'
import { useConversations } from '@/hooks/useConversations'
import { BarChart } from '@/components/stats/BarChart'
import type { AppointmentStatus } from '@/types/database.types'

const STATUS_ORDER: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show']
const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'Pendientes',
  confirmed: 'Confirmadas',
  completed: 'Completadas',
  cancelled: 'Canceladas',
  no_show: 'No asistió',
}
// Colores por estado, no por serie: pending=warning, confirmed=good,
// completed=brand (hito distinto de "buen estado"), cancelled/no_show=critical.
const STATUS_COLOR: Record<AppointmentStatus, string> = {
  pending: 'var(--status-warning)',
  confirmed: 'var(--status-good)',
  completed: 'var(--brand)',
  cancelled: 'var(--status-critical)',
  no_show: 'var(--status-critical)',
}

function lastNDays(n: number) {
  const days: string[] = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export function Estadisticas() {
  const { appointments } = useAppointments()
  const { conversations } = useConversations()

  const statusData = useMemo(
    () =>
      STATUS_ORDER.map((status) => ({
        label: STATUS_LABEL[status],
        value: appointments.filter((a) => a.status === status).length,
        color: STATUS_COLOR[status],
      })),
    [appointments],
  )

  const dailyData = useMemo(() => {
    const days = lastNDays(14)
    return days.map((day) => ({
      label: day.slice(5).replace('-', '/'),
      value: appointments.filter((a) => a.starts_at.slice(0, 10) === day).length,
      color: 'var(--series-1)',
    }))
  }, [appointments])

  // % de conversaciones cuyo cliente terminó con al menos una cita — no
  // "citas / conversaciones" (eso podía superar el 100% si un cliente
  // reservaba varias veces desde la misma conversación).
  const conversionRate = useMemo(() => {
    if (conversations.length === 0) return 0
    const clientsWithAppointment = new Set(appointments.map((a) => a.client_id).filter(Boolean))
    const converted = conversations.filter((c) => clientsWithAppointment.has(c.client_id)).length
    return Math.round((converted / conversations.length) * 100)
  }, [appointments, conversations])

  return (
    <div className="page">
      <h1>Estadísticas</h1>

      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-card__value">{appointments.length}</span>
          <span className="stat-card__label">Citas totales</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{conversations.length}</span>
          <span className="stat-card__label">Conversaciones</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{conversionRate}%</span>
          <span className="stat-card__label">Conversación → cita</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{appointments.filter((a) => a.source === 'bot').length}</span>
          <span className="stat-card__label">Citas creadas por el bot</span>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <BarChart title="Citas por estado" data={statusData} />
        </div>
        <div className="card">
          <BarChart title="Citas creadas (últimos 14 días)" data={dailyData} />
        </div>
      </div>
    </div>
  )
}
