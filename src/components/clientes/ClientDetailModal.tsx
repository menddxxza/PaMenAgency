import { useState } from 'react'
import { updateClientNotes } from '@/lib/mutations'
import { useToast } from '@/context/ToastContext'
import type { Database } from '@/types/database.types'

type Client = Database['public']['Tables']['clients']['Row']
type Appointment = Database['public']['Tables']['appointments']['Row']
type Service = Database['public']['Tables']['services']['Row']

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistió',
}

interface Props {
  client: Client
  appointments: Appointment[]
  serviceById: Map<string, Service>
  onClose: () => void
  onSaved: () => void
}

export function ClientDetailModal({ client, appointments, serviceById, onClose, onSaved }: Props) {
  const { showToast } = useToast()
  const [notes, setNotes] = useState(client.notes ?? '')
  const [saving, setSaving] = useState(false)

  const history = appointments
    .filter((a) => a.client_id === client.id)
    .sort((a, b) => b.starts_at.localeCompare(a.starts_at))

  async function handleSave() {
    setSaving(true)
    try {
      await updateClientNotes(client.id, notes)
      showToast('Notas guardadas')
      onSaved()
      onClose()
    } catch {
      showToast('No se pudieron guardar las notas', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{client.name || client.phone}</h2>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="form-grid">
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Teléfono</span>
            <p style={{ color: 'var(--text-primary)', margin: 0 }}>{client.phone}</p>
          </div>

          <label>
            Notas
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Preferencias, alergias, historial…" />
          </label>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Historial de citas ({history.length})
            </span>
            {history.length === 0 && <p className="empty-state">Sin citas todavía.</p>}
            {history.length > 0 && (
              <div className="mini-list" style={{ marginTop: '0.5rem' }}>
                {history.map((a) => (
                  <div className="mini-list__item" key={a.id}>
                    <span>
                      {a.service_id ? serviceById.get(a.service_id)?.name ?? 'Servicio' : 'Sin servicio'} ·{' '}
                      {new Date(a.starts_at).toLocaleDateString('es-ES')}
                    </span>
                    <span className={`badge badge--${a.status}`}>{STATUS_LABEL[a.status]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal__footer">
          <button type="button" className="btn" onClick={onClose}>
            Cerrar
          </button>
          <button type="button" className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar notas'}
          </button>
        </div>
      </div>
    </div>
  )
}
