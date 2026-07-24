import { useState, type FormEvent } from 'react'
import { useTenant } from '@/context/TenantContext'
import { createInventoryItem, updateInventoryItem } from '@/lib/mutations'
import type { Database } from '@/types/database.types'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

interface Props {
  item?: InventoryItem
  onClose: () => void
  onSaved: () => void
}

export function InventoryItemModal({ item, onClose, onSaved }: Props) {
  const { activeBusinessId } = useTenant()
  const [name, setName] = useState(item?.name ?? '')
  const [unit, setUnit] = useState(item?.unit ?? 'unidad')
  const [quantity, setQuantity] = useState(item ? String(item.quantity) : '0')
  const [minQuantity, setMinQuantity] = useState(item ? String(item.min_quantity) : '0')
  const [unitPrice, setUnitPrice] = useState(item?.unit_price != null ? String(item.unit_price) : '')
  const [expiryDate, setExpiryDate] = useState(item?.expiry_date ?? '')
  const [notes, setNotes] = useState(item?.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!activeBusinessId) return

    const quantityValue = parseFloat(quantity.replace(',', '.'))
    const minQuantityValue = parseFloat(minQuantity.replace(',', '.'))
    if (!Number.isFinite(quantityValue) || quantityValue < 0) {
      setError('Introduce una cantidad válida (0 o más)')
      return
    }
    if (!Number.isFinite(minQuantityValue) || minQuantityValue < 0) {
      setError('Introduce un mínimo válido (0 o más)')
      return
    }

    const unitPriceValue = unitPrice.trim() ? parseFloat(unitPrice.replace(',', '.')) : null
    if (unitPriceValue !== null && !Number.isFinite(unitPriceValue)) {
      setError('El precio no es válido')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        name: name.trim(),
        unit: unit.trim() || 'unidad',
        quantity: quantityValue,
        minQuantity: minQuantityValue,
        unitPrice: unitPriceValue,
        expiryDate: expiryDate || null,
        notes: notes.trim() || null,
      }
      if (item) {
        await updateInventoryItem(item.id, payload)
      } else {
        await createInventoryItem({ businessId: activeBusinessId, ...payload })
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el artículo')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal__header">
          <h2>{item ? 'Editar artículo' : 'Nuevo artículo'}</h2>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="form-grid">
          <label>
            Nombre
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Guantes de nitrilo" />
          </label>
          <label>
            Unidad
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="caja, ml, unidad…" />
          </label>
          <label>
            Cantidad disponible
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} required inputMode="decimal" />
          </label>
          <label>
            Alerta de stock bajo (mínimo)
            <input value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} required inputMode="decimal" />
          </label>
          <label>
            Precio de compra (€)
            <input value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} inputMode="decimal" placeholder="Opcional" />
          </label>
          <label>
            Fecha de caducidad
            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </label>
          <label>
            Notas
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="modal__footer">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting || !name}>
            {submitting ? 'Guardando…' : item ? 'Guardar cambios' : 'Crear artículo'}
          </button>
        </div>
      </form>
    </div>
  )
}
