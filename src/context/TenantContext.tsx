import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { BusinessRole } from '@/types/database.types'

interface Membership {
  businessId: string
  businessName: string
  role: BusinessRole
}

interface TenantContextValue {
  memberships: Membership[]
  activeBusinessId: string | null
  setActiveBusinessId: (id: string) => void
  loading: boolean
}

const ACTIVE_BUSINESS_KEY = 'atiende:active-business-id'

const TenantContext = createContext<TenantContextValue | undefined>(undefined)

export function TenantProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [activeBusinessId, setActiveBusinessIdState] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_BUSINESS_KEY),
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      setMemberships([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    supabase
      .from('business_users')
      .select('role, business_id, businesses(id, name)')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          setMemberships([])
          setLoading(false)
          return
        }

        const rows: Membership[] = data
          .filter((row): row is typeof row & { businesses: { id: string; name: string } } => Boolean(row.businesses))
          .map((row) => ({
            businessId: row.businesses.id,
            businessName: row.businesses.name,
            role: row.role,
          }))

        setMemberships(rows)

        const stillValid = rows.some((m) => m.businessId === activeBusinessId)
        if (!stillValid && rows.length > 0) {
          setActiveBusinessIdState(rows[0].businessId)
          localStorage.setItem(ACTIVE_BUSINESS_KEY, rows[0].businessId)
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  function setActiveBusinessId(id: string) {
    setActiveBusinessIdState(id)
    localStorage.setItem(ACTIVE_BUSINESS_KEY, id)
  }

  return (
    <TenantContext.Provider value={{ memberships, activeBusinessId, setActiveBusinessId, loading }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant debe usarse dentro de <TenantProvider>')
  return ctx
}
