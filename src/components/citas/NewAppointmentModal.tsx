import { useState, type FormEvent } from 'react'
import { useTenant } from '@/context/TenantContext'
import { useServices } from '@/hooks/useServices'
import { createAppointment, upsertClient } from '@/lib/mutations'

interface Props {
  onClose: () => void
  onCreated: () => void
}

export function NewAppointmentModal({ onClose, onCreated }: Props) {
  const { activeBusinessId } = useTenant()
  const { services } = useServices()
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!activeBusinessId) return
    setSubmitting(true)
    setError(null)
    try {
      const client = await upsertClient(activeBusinessId, clientPhone, clientName || undefined)
      await createAppointment({
        businessId: activeBusinessId,
        clientId: client.id,
        serviceId: serviceId || null,
        startsAt: new Date(startsAt).toISOString(),
        status: 'confirmed',
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cita')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal__header">
          <h2>Nueva cita</h2>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="form-grid">
          <label>
            Nombre del cliente
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Opcional" />
          </label>
          <label>
            Teléfono
            <input
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              required
              placeholder="+34 600 000 000"
            />
          </label>
          <label>
            Servicio
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              <option value="">Sin especificar</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fecha y hora
            <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal__footer">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Crear cita'}
          </button>
        </div>
      </form>
    </div>
  )
}
