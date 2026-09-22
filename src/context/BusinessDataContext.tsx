import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/context/TenantContext'
import type { Database } from '@/types/database.types'

type Appointment = Database['public']['Tables']['appointments']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']
type Client = Database['public']['Tables']['clients']['Row']
type Service = Database['public']['Tables']['services']['Row']

interface BusinessDataContextValue {
  appointments: Appointment[]
  conversations: Conversation[]
  clients: Client[]
  services: Service[]
  loading: boolean
  refreshClients: () => Promise<void>
  refreshServices: () => Promise<void>
}

const BusinessDataContext = createContext<BusinessDataContextValue | undefined>(undefined)

// Citas, conversaciones, clientes y servicios los montaba cada página por su
// cuenta: ir de Dashboard a Citas volvía a descargarlo todo y a abrir de
// nuevo los canales de Realtime, con su "Cargando…" cada vez. Viviendo aquí
// se cargan una vez por negocio y la navegación es instantánea.
export function BusinessDataProvider({ children }: { children: ReactNode }) {
  const { activeBusinessId } = useTenant()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  const refreshClients = useCallback(async () => {
    if (!activeBusinessId) return
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('business_id', activeBusinessId)
      .order('name', { ascending: true })
    setClients(data ?? [])
  }, [activeBusinessId])

  const refreshServices = useCallback(async () => {
    if (!activeBusinessId) return
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', activeBusinessId)
      .order('created_at', { ascending: true })
    setServices(data ?? [])
  }, [activeBusinessId])

  useEffect(() => {
    if (!activeBusinessId) {
      setAppointments([])
      setConversations([])
      setClients([])
      setServices([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    // Al cambiar de negocio hay que vaciar antes de pedir: si no, durante un
    // instante se ven los datos del negocio anterior bajo el nombre nuevo.
    setAppointments([])
    setConversations([])
    setClients([])
    setServices([])

    Promise.all([
      supabase.from('appointments').select('*').eq('business_id', activeBusinessId).order('starts_at', { ascending: true }),
      supabase.from('conversations').select('*').eq('business_id', activeBusinessId).order('last_message_at', { ascending: false }),
      supabase.from('clients').select('*').eq('business_id', activeBusinessId).order('name', { ascending: true }),
      supabase.from('services').select('*').eq('business_id', activeBusinessId).order('created_at', { ascending: true }),
    ]).then(([appointmentsRes, conversationsRes, clientsRes, servicesRes]) => {
      if (cancelled) return
      setAppointments(appointmentsRes.data ?? [])
      setConversations(conversationsRes.data ?? [])
      setClients(clientsRes.data ?? [])
      setServices(servicesRes.data ?? [])
      setLoading(false)
    })

    const channel = supabase
      .channel(`business:${activeBusinessId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `business_id=eq.${activeBusinessId}` },
        (payload) => {
          setAppointments((current) => {
            if (payload.eventType === 'DELETE') {
              return current.filter((a) => a.id !== (payload.old as Appointment).id)
            }
            const next = payload.new as Appointment
            return [...current.filter((a) => a.id !== next.id), next].sort((a, b) =>
              a.starts_at.localeCompare(b.starts_at),
            )
          })
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `business_id=eq.${activeBusinessId}` },
        (payload) => {
          setConversations((current) => {
            if (payload.eventType === 'DELETE') {
              return current.filter((c) => c.id !== (payload.old as Conversation).id)
            }
            const next = payload.new as Conversation
            return [next, ...current.filter((c) => c.id !== next.id)].sort((a, b) =>
              b.last_message_at.localeCompare(a.last_message_at),
            )
          })
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients', filter: `business_id=eq.${activeBusinessId}` },
        (payload) => {
          setClients((current) => {
            if (payload.eventType === 'DELETE') {
              return current.filter((c) => c.id !== (payload.old as Client).id)
            }
            const next = payload.new as Client
            return [...current.filter((c) => c.id !== next.id), next].sort((a, b) =>
              (a.name ?? '').localeCompare(b.name ?? '', 'es'),
            )
          })
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [activeBusinessId])

  return (
    <BusinessDataContext.Provider
      value={{ appointments, conversations, clients, services, loading, refreshClients, refreshServices }}
    >
      {children}
    </BusinessDataContext.Provider>
  )
}

function useBusinessData() {
  const ctx = useContext(BusinessDataContext)
  if (!ctx) throw new Error('Los datos del negocio requieren <BusinessDataProvider>')
  return ctx
}

// Se mantiene la forma que ya devolvían los hooks sueltos, para que las
// páginas no tengan que cambiar sus llamadas.
export function useAppointments() {
  const { appointments, loading } = useBusinessData()
  return { appointments, loading }
}

export function useConversations() {
  const { conversations, loading } = useBusinessData()
  return { conversations, loading }
}

export function useClients() {
  const { clients, loading, refreshClients } = useBusinessData()
  return { clients, loading, refresh: refreshClients }
}

export function useServices() {
  const { services, loading, refreshServices } = useBusinessData()
  return { services, loading, refresh: refreshServices }
}
