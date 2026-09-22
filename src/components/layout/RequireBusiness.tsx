import { useTenant } from '@/context/TenantContext'
import { OnboardingBusiness } from '@/pages/OnboardingBusiness'
import { FullPageLoader } from '@/components/layout/FullPageLoader'

export function RequireBusiness({ children }: { children: React.ReactNode }) {
  const { memberships, loading } = useTenant()

  if (loading) return <FullPageLoader />
  if (memberships.length === 0) return <OnboardingBusiness />

  return <>{children}</>
}
