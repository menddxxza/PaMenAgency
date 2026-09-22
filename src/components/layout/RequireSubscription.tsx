import { useSubscription } from '@/hooks/useSubscription'
import { Suscripcion } from '@/pages/Suscripcion'
import { FullPageLoader } from '@/components/layout/FullPageLoader'

export function RequireSubscription({ children }: { children: React.ReactNode }) {
  const { isActive, loading } = useSubscription()

  if (loading) return <FullPageLoader />
  if (!isActive) return <Suscripcion />

  return <>{children}</>
}
