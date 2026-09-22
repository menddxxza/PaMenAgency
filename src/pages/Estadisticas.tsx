import { useMemo } from 'react'
import { useAppointments } from '@/hooks/useAppointments'
import { useConversations } from '@/hooks/useConversations'
import { BarChart } from '@/components/stats/BarChart'
import { usePageTitle } from '@/hooks/usePageTitle'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonStats } from '@/components/ui/Skeleton'
import { IconEstadisticas } from '@/components/layout/NavIcons'
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

// toISOString() da la fecha en UTC: en España (UTC+1/+2) una cita de las
// 00:30 caía en el día anterior y el gráfico la contaba en la barra que no
// era. Se agrupa por día local.
function localDayKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function lastNDays(n: number) {
  const days: string[] = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(localDayKey(d))
  }
  return days
}

export function Estadisticas() {
  usePageTitle('Estadísticas')
  const { appointments, loading } = useAppointments()
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
    const countByDay = new Map<string, number>()
    for (const a of appointments) {
      const key = localDayKey(new Date(a.starts_at))
      countByDay.set(key, (countByDay.get(key) ?? 0) + 1)
    }
    return lastNDays(14).map((day) => ({
      label: day.slice(5).replace('-', '/'),
      value: countByDay.get(day) ?? 0,
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

  if (loading) {
    return (
      <div className="page">
        <h1>Estadísticas</h1>
        <SkeletonStats />
      </div>
    )
  }

  if (appointments.length === 0 && conversations.length === 0) {
    return (
      <div className="page">
        <h1>Estadísticas</h1>
        <div className="card">
          <EmptyState
            icon={<IconEstadisticas />}
            title="Aún no hay datos que medir"
            description="En cuanto empiecen a entrar citas y conversaciones verás aquí cómo evolucionan, y qué parte del trabajo está haciendo el bot por ti."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1>Estadísticas</h1>
          <p>Cómo va el negocio y cuánto está aportando el bot.</p>
        </div>
      </div>

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
