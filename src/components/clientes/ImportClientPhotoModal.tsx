import { useRef, useState } from 'react'
import { useTenant } from '@/context/TenantContext'
import { scanClientDocument, type ScannedClientRow } from '@/lib/documentScan'
import { upsertClient, updateClientNotes } from '@/lib/mutations'

interface Props {
  onClose: () => void
  onImported: () => void
}

export function ImportClientPhotoModal({ onClose, onImported }: Props) {
  const { activeBusinessId } = useTenant()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [rows, setRows] = useState<ScannedClientRow[]>([])
  const [scanning, setScanning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    setRows([])
    setPreview(URL.createObjectURL(file))
    setScanning(true)
    try {
      const scanned = await scanClientDocument(file)
      if (scanned.length === 0) {
        setError('No se han reconocido datos de cliente en la foto. Prueba con más luz o más de cerca.')
      }
      setRows(scanned)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo leer el documento')
    } finally {
      setScanning(false)
    }
  }

  function updateRow(index: number, patch: Partial<ScannedClientRow>) {
    setRows((current) => current.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  function removeRow(index: number) {
    setRows((current) => current.filter((_, i) => i !== index))
  }

  async function handleConfirm() {
    if (!activeBusinessId || rows.length === 0) return
    if (rows.some((r) => !r.phone.trim())) {
      setError('Cada cliente necesita un teléfono antes de importar. Complétalo o quita la fila.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      for (const row of rows) {
        const client = await upsertClient(activeBusinessId, row.phone.trim(), row.name.trim() || undefined)
        const combinedNotes = [row.notes.trim(), row.email.trim() ? `Email: ${row.email.trim()}` : '']
          .filter(Boolean)
          .join(' · ')
        if (combinedNotes) {
          await updateClientNotes(client.id, combinedNotes)
        }
      }
      onImported()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar los clientes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Añadir cliente con foto</h2>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="scan-hint">
          Haz una foto a la ficha o documento en papel del cliente y se intentarán leer sus datos automáticamente.
          Revisa siempre la información antes de importar: el reconocimiento puede equivocarse.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={scanning}
        >
          {scanning ? 'Leyendo la foto…' : preview ? 'Hacer otra foto' : 'Hacer foto / subir imagen'}
        </button>

        {preview && <img src={preview} alt="" className="scan-preview" />}

        {error && <p className="form-error">{error}</p>}

        {rows.length > 0 && (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Notas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <input value={row.name} onChange={(e) => updateRow(i, { name: e.target.value })} />
                    </td>
                    <td>
                      <input value={row.phone} onChange={(e) => updateRow(i, { phone: e.target.value })} />
                    </td>
                    <td>
                      <input value={row.email} onChange={(e) => updateRow(i, { email: e.target.value })} />
                    </td>
                    <td>
                      <input value={row.notes} onChange={(e) => updateRow(i, { notes: e.target.value })} />
                    </td>
                    <td>
                      <button type="button" className="btn btn--sm btn--danger" onClick={() => removeRow(i)}>
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal__footer">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn--primary" disabled={rows.length === 0 || saving} onClick={handleConfirm}>
            {saving ? 'Guardando…' : `Importar ${rows.length} cliente${rows.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </div>
  )
}
