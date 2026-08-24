import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppointments } from '@/hooks/useAppointments'
import { useConversations } from '@/hooks/useConversations'
import { useClients } from '@/hooks/useClients'
import { useSubscription } from '@/hooks/useSubscription'
import { usePageTitle } from '@/hooks/usePageTitle'
import { PLANS } from '@/lib/plans'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonRows, SkeletonStats } from '@/components/ui/Skeleton'
import { IconCitas, IconInbox } from '@/components/layout/NavIcons'

const PREVIEW_LIMIT = 5

function formatDayLabel(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

  if (sameDay(date, today)) return `Hoy · ${time}`
  if (sameDay(date, tomorrow)) return `Mañana · ${time}`
  return date.toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function Dashboard() {
  usePageTitle('Dashboard')
  const { appointments, loading } = useAppointments()
  const { conversations } = useConversations()
  const { clients } = useClients()
  const { subscription } = useSubscription()

  const plan = PLANS[subscription?.plan ?? 'starter']
  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients])

  const { upcoming, upcomingCount, todayCount, pendingCount, openConversations, openCount } = useMemo(() => {
    const now = new Date()
    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)

    const upcomingAll = appointments
      .filter((a) => (a.status === 'pending' || a.status === 'confirmed') && new Date(a.starts_at) >= now)
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))

    const openAll = conversations.filter((c) => c.status === 'open')

    return {
      // Antes las tarjetas mostraban la longitud de la lista ya recortada a
      // 5, así que un negocio con 30 citas próximas leía "5". Ahora el
      // recorte es solo de la vista previa; el contador es el total real.
      upcoming: upcomingAll.slice(0, PREVIEW_LIMIT),
      upcomingCount: upcomingAll.length,
      todayCount: upcomingAll.filter((a) => new Date(a.starts_at) <= endOfToday).length,
      pendingCount: appointments.filter((a) => a.status === 'pending').length,
      openConversations: openAll.slice(0, PREVIEW_LIMIT),
      openCount: openAll.length,
    }
  }, [appointments, conversations])

  const isBrandNew = !loading && appointments.length === 0 && conversations.length === 0 && clients.length === 0

  if (loading) {
    return (
      <div className="page">
        <h1>Dashboard</h1>
        <SkeletonStats />
        <div className="two-col">
          <div className="card">
            <SkeletonRows />
          </div>
          <div className="card">
            <SkeletonRows />
          </div>
        </div>
      </div>
    )
  }

  if (isBrandNew) {
    return (
      <div className="page">
        <h1>Todo listo para empezar</h1>
        <div className="card">
          <EmptyState
            icon={<IconCitas />}
            title="Tu panel está esperando la primera cita"
            description="En cuanto entre la primera consulta por WhatsApp, o crees una cita a mano, aquí verás tu agenda del día, las citas por confirmar y las conversaciones abiertas."
            action={
              <div className="blank-slate__actions">
                <Link to="/app/citas" className="btn btn--primary" style={{ textDecoration: 'none' }}>
                  Crear la primera cita
                </Link>
                <Link to="/app/configuracion" className="btn" style={{ textDecoration: 'none' }}>
                  Configurar servicios y bot
                </Link>
              </div>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1>Dashboard</h1>
          <p>Un vistazo rápido a cómo va el negocio hoy.</p>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-card__value">{todayCount}</span>
          <span className="stat-card__label">Citas que quedan hoy</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{upcomingCount}</span>
          <span className="stat-card__label">Próximas citas</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{pendingCount}</span>
          <span className="stat-card__label">Citas por confirmar</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{openCount}</span>
          <span className="stat-card__label">Conversaciones abiertas</span>
        </div>
        {plan.hasClientes && (
          <div className="stat-card">
            <span className="stat-card__value">{clients.length}</span>
            <span className="stat-card__label">Clientes</span>
          </div>
        )}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="page__header" style={{ marginBottom: '0.75rem' }}>
            <span className="card__title" style={{ marginBottom: 0 }}>
              Próximas citas
            </span>
            <Link to="/app/citas" className="btn btn--ghost btn--sm" style={{ textDecoration: 'none' }}>
              Ver todas
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <EmptyState
              icon={<IconCitas />}
              title="Sin citas por delante"
              description="Cuando el bot reserve una cita o la crees a mano, aparecerá aquí ordenada por hora."
              action={
                <Link to="/app/citas" className="btn btn--sm" style={{ textDecoration: 'none' }}>
                  Crear cita
                </Link>
              }
            />
          ) : (
            <div className="mini-list">
              {upcoming.map((a) => {
                const client = a.client_id ? clientById.get(a.client_id) : null
                return (
                  <div className="mini-list__item" key={a.id}>
                    <span>{client?.name || client?.phone || 'Cliente'}</span>
                    <span className="mini-list__meta">{formatDayLabel(a.starts_at)}</span>
                  </div>
                )
              })}
              {upcomingCount > PREVIEW_LIMIT && (
                <span className="mini-list__more">y {upcomingCount - PREVIEW_LIMIT} más</span>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <div className="page__header" style={{ marginBottom: '0.75rem' }}>
            <span className="card__title" style={{ marginBottom: 0 }}>
              Conversaciones abiertas
            </span>
            <Link to="/app/conversaciones" className="btn btn--ghost btn--sm" style={{ textDecoration: 'none' }}>
              Ver todas
            </Link>
          </div>

          {openConversations.length === 0 ? (
            <EmptyState
              icon={<IconInbox />}
              title="Ninguna conversación abierta"
              description="Las consultas que entren por WhatsApp aparecerán aquí, y podrás tomar el control del chat cuando el bot no llegue."
            />
          ) : (
            <div className="mini-list">
              {openConversations.map((c) => {
                const client = clientById.get(c.client_id)
                return (
                  <div className="mini-list__item" key={c.id}>
                    <span>{client?.name || client?.phone || 'Cliente'}</span>
                    <span className="mini-list__meta">{formatDayLabel(c.last_message_at)}</span>
                  </div>
                )
              })}
              {openCount > PREVIEW_LIMIT && (
                <span className="mini-list__more">y {openCount - PREVIEW_LIMIT} más</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
