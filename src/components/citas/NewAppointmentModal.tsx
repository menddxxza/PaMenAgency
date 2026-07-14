import { useState, type FormEvent } from 'react'
import { useTenant } from '@/context/TenantContext'
import { useServices } from '@/hooks/useServices'
import { useClients } from '@/hooks/useClients'
import { createAppointment, upsertClient } from '@/lib/mutations'

interface Props {
  onClose: () => void
  onCreated: () => void
}

const PHONE_RE = /^\+?[0-9\s()-]{6,20}$/

export function NewAppointmentModal({ onClose, onCreated }: Props) {
  const { activeBusinessId } = useTenant()
  const { services } = useServices()
  const { clients, refresh: refreshClients } = useClients()

  // `clients` todavía está vacío en el primer render (useClients carga
  // async), así que no se puede decidir el modo por defecto de una sola vez
  // con useState — mode empieza en null ("auto") y se resuelve más abajo en
  // función de si ya hay clientes cargados, hasta que el usuario lo cambie
  // a mano.
  const [mode, setMode] = useState<'existing' | 'new' | null>(null)
  const resolvedMode = mode ?? (clients.length > 0 ? 'existing' : 'new')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!activeBusinessId) return

    if (resolvedMode === 'existing' && !selectedClientId) {
      setError('Selecciona un cliente o crea uno nuevo')
      return
    }
    if (resolvedMode === 'new' && !PHONE_RE.test(clientPhone.trim())) {
      setError('Introduce un teléfono válido (solo dígitos, espacios, +, - y paréntesis)')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      let clientId = selectedClientId
      if (resolvedMode === 'new') {
        const client = await upsertClient(activeBusinessId, clientPhone.trim(), clientName.trim() || undefined)
        clientId = client.id
        refreshClients()
      }

      await createAppointment({
        businessId: activeBusinessId,
        clientId,
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
          {resolvedMode === 'existing' ? (
            <label>
              Cliente
              <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} required>
                <option value="">Selecciona un cliente…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name ? `${c.name} (${c.phone})` : c.phone}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                style={{ alignSelf: 'flex-start', padding: '0.2rem 0' }}
                onClick={() => {
                  setMode('new')
                  setError(null)
                }}
              >
                + Cliente nuevo
              </button>
            </label>
          ) : (
            <>
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
              {clients.length > 0 && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  style={{ alignSelf: 'flex-start', padding: '0.2rem 0' }}
                  onClick={() => {
                    setMode('existing')
                    setError(null)
                  }}
                >
                  Elegir de la lista de clientes
                </button>
              )}
            </>
          )}

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
