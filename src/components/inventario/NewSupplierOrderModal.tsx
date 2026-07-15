import { useState, type FormEvent } from 'react'
import { useTenant } from '@/context/TenantContext'
import { useInventory } from '@/hooks/useInventory'
import { createSupplierOrder } from '@/lib/mutations'

interface Props {
  onClose: () => void
  onCreated: () => void
}

export function NewSupplierOrderModal({ onClose, onCreated }: Props) {
  const { activeBusinessId } = useTenant()
  const { items } = useInventory()

  const [itemId, setItemId] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!activeBusinessId) return

    const quantityValue = parseFloat(quantity.replace(',', '.'))
    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      setError('Introduce una cantidad válida, mayor que 0')
      return
    }
    if (!supplierName.trim()) {
      setError('Introduce el nombre del proveedor')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await createSupplierOrder({
        businessId: activeBusinessId,
        itemId: itemId || null,
        supplierName: supplierName.trim(),
        quantity: quantityValue,
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal__header">
          <h2>Nuevo pedido a proveedor</h2>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="form-grid">
          <label>
            Artículo
            <select value={itemId} onChange={(e) => setItemId(e.target.value)}>
              <option value="">Sin vincular a un artículo</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Proveedor
            <input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} required placeholder="Distribuciones ACME" />
          </label>
          <label>
            Cantidad pedida
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} required inputMode="decimal" />
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="modal__footer">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Registrar pedido'}
          </button>
        </div>
      </form>
    </div>
  )
}
