import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTenant } from '@/context/TenantContext'
import type { Database } from '@/types/database.types'

type Appointment = Database['public']['Tables']['appointments']['Row']

export function useAppointments() {
  const { activeBusinessId } = useTenant()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeBusinessId) return

    let cancelled = false
    setLoading(true)

    supabase
      .from('appointments')
      .select('*')
      .eq('business_id', activeBusinessId)
      .order('starts_at', { ascending: true })
      .then(({ data }) => {
        if (cancelled) return
        setAppointments(data ?? [])
        setLoading(false)
      })

    const channel = supabase
      .channel(`appointments:${activeBusinessId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `business_id=eq.${activeBusinessId}` },
        (payload) => {
          setAppointments((current) => {
            if (payload.eventType === 'DELETE') {
              return current.filter((a) => a.id !== (payload.old as Appointment).id)
            }
            const next = payload.new as Appointment
            const withoutNext = current.filter((a) => a.id !== next.id)
            return [...withoutNext, next].sort((a, b) => a.starts_at.localeCompare(b.starts_at))
          })
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [activeBusinessId])

  return { appointments, loading }
}
