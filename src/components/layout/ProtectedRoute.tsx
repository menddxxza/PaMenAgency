import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { FullPageLoader } from '@/components/layout/FullPageLoader'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) return <FullPageLoader />
  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}
