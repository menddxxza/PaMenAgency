import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) return <div className="page">Cargando…</div>
  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}
