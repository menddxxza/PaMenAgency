import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { BusinessRole } from '@/types/database.types'

export interface Membership {
  businessId: string
  businessName: string
  role: BusinessRole
}

interface TenantContextValue {
  memberships: Membership[]
  activeBusinessId: string | null
  setActiveBusinessId: (id: string) => void
  loading: boolean
  refresh: () => Promise<void>
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

  const refresh = useCallback(async () => {
    if (!session) {
      setMemberships([])
      setLoading(false)
      return
    }

    setLoading(true)

    const { data: businessUsers, error: buError } = await supabase
      .from('business_users')
      .select('business_id, role')

    if (buError || !businessUsers || businessUsers.length === 0) {
      setMemberships([])
      setLoading(false)
      return
    }

    const businessIds = businessUsers.map((row: { business_id: string }) => row.business_id)
    const { data: businesses } = await supabase.from('businesses').select('id, name').in('id', businessIds)

    const nameById = new Map((businesses ?? []).map((b: { id: string; name: string }) => [b.id, b.name]))

    const rows: Membership[] = businessUsers.map((row: { business_id: string; role: BusinessRole }) => ({
      businessId: row.business_id,
      businessName: nameById.get(row.business_id) ?? 'Negocio',
      role: row.role,
    }))

    setMemberships(rows)

    setActiveBusinessIdState((current) => {
      const stillValid = rows.some((m) => m.businessId === current)
      const next = stillValid ? current : (rows[0]?.businessId ?? null)
      if (next) localStorage.setItem(ACTIVE_BUSINESS_KEY, next)
      return next
    })

    setLoading(false)
  }, [session])

  useEffect(() => {
    refresh()
  }, [refresh])

  function setActiveBusinessId(id: string) {
    setActiveBusinessIdState(id)
    localStorage.setItem(ACTIVE_BUSINESS_KEY, id)
  }

  return (
    <TenantContext.Provider value={{ memberships, activeBusinessId, setActiveBusinessId, loading, refresh }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant debe usarse dentro de <TenantProvider>')
  return ctx
}
