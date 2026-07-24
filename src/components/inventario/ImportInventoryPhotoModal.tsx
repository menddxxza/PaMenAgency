import { useRef, useState } from 'react'
import { useTenant } from '@/context/TenantContext'
import { scanInventoryDocument, type ScannedInventoryRow } from '@/lib/documentScan'
import { createInventoryItem } from '@/lib/mutations'

interface Props {
  onClose: () => void
  onImported: () => void
}

export function ImportInventoryPhotoModal({ onClose, onImported }: Props) {
  const { activeBusinessId } = useTenant()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [rows, setRows] = useState<ScannedInventoryRow[]>([])
  const [scanning, setScanning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    setRows([])
    setPreview(URL.createObjectURL(file))
    setScanning(true)
    try {
      const scanned = await scanInventoryDocument(file)
      if (scanned.length === 0) {
        setError('No se ha reconocido ningún artículo en la foto. Prueba con más luz o más de cerca.')
      }
      setRows(scanned)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo leer el documento')
    } finally {
      setScanning(false)
    }
  }

  function updateRow(index: number, patch: Partial<ScannedInventoryRow>) {
    setRows((current) => current.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  function removeRow(index: number) {
    setRows((current) => current.filter((_, i) => i !== index))
  }

  async function handleConfirm() {
    if (!activeBusinessId || rows.length === 0) return
    setSaving(true)
    setError(null)
    try {
      for (const row of rows) {
        if (!row.name.trim()) continue
        await createInventoryItem({
          businessId: activeBusinessId,
          name: row.name.trim(),
          unit: row.unit.trim() || 'unidad',
          quantity: row.quantity,
          minQuantity: 0,
          unitPrice: row.unitPrice,
          expiryDate: null,
          notes: null,
        })
      }
      onImported()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar los artículos')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Importar albarán con foto</h2>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="scan-hint">
          Haz una foto al albarán o factura del proveedor y se intentará leer cada artículo automáticamente. Revisa
          siempre los datos antes de importar: el reconocimiento puede equivocarse.
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
                  <th>Cantidad</th>
                  <th>Unidad</th>
                  <th>Precio (€)</th>
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
                      <input
                        value={row.quantity}
                        inputMode="decimal"
                        onChange={(e) => updateRow(i, { quantity: parseFloat(e.target.value.replace(',', '.')) || 0 })}
                      />
                    </td>
                    <td>
                      <input value={row.unit} onChange={(e) => updateRow(i, { unit: e.target.value })} />
                    </td>
                    <td>
                      <input
                        value={row.unitPrice ?? ''}
                        inputMode="decimal"
                        onChange={(e) =>
                          updateRow(i, {
                            unitPrice: e.target.value ? parseFloat(e.target.value.replace(',', '.')) : null,
                          })
                        }
                      />
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
            {saving ? 'Guardando…' : `Importar ${rows.length} artículo${rows.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </div>
  )
}
