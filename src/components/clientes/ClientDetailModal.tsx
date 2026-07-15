import { useRef, useState } from 'react'
import { deleteClientDocument, getClientDocumentUrl, updateClientNotes, uploadClientDocument } from '@/lib/mutations'
import { useClientDocuments } from '@/hooks/useClientDocuments'
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
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { documents, loading: loadingDocuments, refresh: refreshDocuments } = useClientDocuments(client.id)

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

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadClientDocument({ businessId: client.business_id, clientId: client.id, file })
      refreshDocuments()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo subir el documento', 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleView(storagePath: string) {
    try {
      const url = await getClientDocumentUrl(storagePath)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      showToast('No se pudo abrir el documento', 'error')
    }
  }

  async function handleDeleteDocument(id: string, storagePath: string) {
    try {
      await deleteClientDocument(id, storagePath)
      refreshDocuments()
    } catch {
      showToast('No se pudo eliminar el documento', 'error')
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

          <div>
            <div className="page__header" style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Documentos ({documents.length})
              </span>
              <button type="button" className="btn btn--sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? 'Subiendo…' : '+ Subir documento'}
              </button>
              <input ref={fileInputRef} type="file" hidden onChange={handleUpload} />
            </div>

            {loadingDocuments && <p className="empty-state">Cargando…</p>}
            {!loadingDocuments && documents.length === 0 && (
              <p className="empty-state">Sin documentos (contratos, consentimientos, fotos…).</p>
            )}
            {!loadingDocuments && documents.length > 0 && (
              <div className="mini-list">
                {documents.map((doc) => (
                  <div className="mini-list__item" key={doc.id}>
                    <span>
                      {doc.name} · {new Date(doc.created_at).toLocaleDateString('es-ES')}
                    </span>
                    <div className="table__actions">
                      <button type="button" className="btn btn--sm" onClick={() => handleView(doc.storage_path)}>
                        Ver
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => handleDeleteDocument(doc.id, doc.storage_path)}
                      >
                        Eliminar
                      </button>
                    </div>
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
