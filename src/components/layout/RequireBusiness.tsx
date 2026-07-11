import { useTenant } from '@/context/TenantContext'
import { OnboardingBusiness } from '@/pages/OnboardingBusiness'

export function RequireBusiness({ children }: { children: React.ReactNode }) {
  const { memberships, loading } = useTenant()

  if (loading) return <div className="page">Cargando…</div>
  if (memberships.length === 0) return <OnboardingBusiness />

  return <>{children}</>
}
