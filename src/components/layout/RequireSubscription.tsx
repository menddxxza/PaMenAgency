import { useSubscription } from '@/hooks/useSubscription'
import { Suscripcion } from '@/pages/Suscripcion'

export function RequireSubscription({ children }: { children: React.ReactNode }) {
  const { isActive, loading } = useSubscription()

  if (loading) return <div className="page">Cargando…</div>
  if (!isActive) return <Suscripcion />

  return <>{children}</>
}
