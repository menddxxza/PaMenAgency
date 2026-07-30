import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/context/TenantContext'
import type { Database } from '@/types/database.types'

type Subscription = Database['public']['Tables']['subscriptions']['Row']

interface SubscriptionContextValue {
  subscription: Subscription | null
  isActive: boolean
  /** Prueba gratis en curso (no caducada). */
  isTrialing: boolean
  /** Días completos que quedan de prueba; 0 el último día. null si no hay prueba. */
  trialDaysLeft: number | null
  /** La prueba existió pero ya pasó su fecha de fin. */
  trialExpired: boolean
  loading: boolean
  refresh: () => Promise<void>
}

const DAY_MS = 24 * 60 * 60 * 1000

// Misma regla que business_plan() en 0011_free_trial.sql: una prueba cuenta
// como acceso solo mientras no haya pasado su fecha de fin. Si estas dos
// condiciones se separan, el panel enseñaría pantallas que la base de datos
// bloquea (o al revés).
function evaluate(subscription: Subscription | null) {
  if (!subscription) {
    return { isActive: false, isTrialing: false, trialDaysLeft: null, trialExpired: false }
  }

  if (subscription.status === 'active') {
    return { isActive: true, isTrialing: false, trialDaysLeft: null, trialExpired: false }
  }

  if (subscription.status === 'trialing') {
    if (!subscription.current_period_end) {
      return { isActive: true, isTrialing: true, trialDaysLeft: null, trialExpired: false }
    }
    const remainingMs = new Date(subscription.current_period_end).getTime() - Date.now()
    if (remainingMs <= 0) {
      return { isActive: false, isTrialing: false, trialDaysLeft: 0, trialExpired: true }
    }
    return {
      isActive: true,
      isTrialing: true,
      trialDaysLeft: Math.floor(remainingMs / DAY_MS),
      trialExpired: false,
    }
  }

  return { isActive: false, isTrialing: false, trialDaysLeft: null, trialExpired: false }
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined)

// La suscripción la consultaban por separado Shell, RequireSubscription,
// RequirePlanFeature, Suscripcion y BillingSection: cinco peticiones por
// carga y cinco "Cargando…" encadenados, así que al entrar al panel se veía
// parpadear la pantalla varias veces. Aquí se pide una sola vez.
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { activeBusinessId, loading: tenantLoading } = useTenant()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!activeBusinessId) {
      // Sin negocio activo no hay nada que consultar, pero había que dejar
      // de cargar: antes se quedaba en `loading` para siempre y los guardas
      // de ruta mostraban "Cargando…" indefinidamente.
      setSubscription(null)
      setLoading(tenantLoading)
      return
    }

    setLoading(true)
    // maybeSingle y no single: un negocio sin fila de suscripción es un caso
    // normal (recién creado), no un error PGRST116 en la consola.
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('business_id', activeBusinessId)
      .maybeSingle()

    setSubscription(data ?? null)
    setLoading(false)
  }, [activeBusinessId, tenantLoading])

  useEffect(() => {
    refresh()
  }, [refresh])

  const { isActive, isTrialing, trialDaysLeft, trialExpired } = evaluate(subscription)

  return (
    <SubscriptionContext.Provider
      value={{ subscription, isActive, isTrialing, trialDaysLeft, trialExpired, loading, refresh }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscription debe usarse dentro de <SubscriptionProvider>')
  return ctx
}
