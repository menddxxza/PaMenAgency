import { useAppointments } from '@/hooks/useAppointments'

export function Citas() {
  const { appointments, loading } = useAppointments()

  return (
    <div className="page">
      <h1>Citas</h1>
      {loading && <p>Cargando…</p>}
      <ul className="list">
        {appointments.map((a) => (
          <li key={a.id} className="list__item">
            <span>{new Date(a.starts_at).toLocaleString('es-ES')}</span>
            <span className={`badge badge--${a.status}`}>{a.status}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
