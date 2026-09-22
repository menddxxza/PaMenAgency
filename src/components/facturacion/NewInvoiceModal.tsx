import { useState, type FormEvent } from 'react'
import { useTenant } from '@/context/TenantContext'
import { useClients } from '@/hooks/useClients'
import { useServices } from '@/hooks/useServices'
import { createInvoice } from '@/lib/mutations'
import { Modal } from '@/components/ui/Modal'
import type { InvoiceType } from '@/types/database.types'

interface Props {
  onClose: () => void
  onCreated: () => void
}

interface DraftItem {
  serviceId: string
  description: string
  quantity: string
  unitPrice: string
}

const EMPTY_ITEM: DraftItem = { serviceId: '', description: '', quantity: '1', unitPrice: '' }

function centsFromEuros(value: string): number {
  const parsed = parseFloat(value.replace(',', '.'))
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0
}

function formatEuros(cents: number): string {
  return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

export function NewInvoiceModal({ onClose, onCreated }: Props) {
  const { activeBusinessId } = useTenant()
  const { clients } = useClients()
  const { services } = useServices()

  const [type, setType] = useState<InvoiceType>('invoice')
  const [clientId, setClientId] = useState('')
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState('')
  const [taxRate, setTaxRate] = useState('21')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<DraftItem[]>([{ ...EMPTY_ITEM }])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleItemChange(index: number, field: keyof DraftItem, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function handleServicePick(index: number, serviceId: string) {
    const service = services.find((s) => s.id === serviceId)
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              serviceId,
              description: service?.name ?? item.description,
              unitPrice: service ? (service.price_cents / 100).toString() : item.unitPrice,
            }
          : item,
      ),
    )
  }

  function handleAddItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }])
  }

  function handleRemoveItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const parsedItems = items.map((item) => ({
    ...item,
    quantityValue: parseFloat(item.quantity.replace(',', '.')) || 0,
    unitPriceCents: centsFromEuros(item.unitPrice),
  }))
  const subtotalCents = parsedItems.reduce((sum, item) => sum + Math.round(item.quantityValue * item.unitPriceCents), 0)
  const taxRateValue = parseFloat(taxRate.replace(',', '.')) || 0
  const taxCents = Math.round((subtotalCents * taxRateValue) / 100)
  const totalCents = subtotalCents + taxCents

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!activeBusinessId) return

    const validItems = parsedItems.filter((item) => item.description.trim() && item.unitPriceCents > 0)
    if (validItems.length === 0) {
      setError('Añade al menos una línea con descripción y precio')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await createInvoice({
        businessId: activeBusinessId,
        clientId: clientId || null,
        type,
        issueDate,
        dueDate: dueDate || null,
        notes: notes.trim() || null,
        taxRate: taxRateValue,
        items: validItems.map((item) => ({
          serviceId: item.serviceId || null,
          description: item.description.trim(),
          quantity: item.quantityValue,
          unitPriceCents: item.unitPriceCents,
        })),
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el documento')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={type === 'quote' ? 'Nuevo presupuesto' : 'Nueva factura'}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Guardando…' : type === 'quote' ? 'Crear presupuesto' : 'Crear factura'}
          </button>
        </>
      }
    >
        <div className="form-grid">
          <label>
            Tipo de documento
            <select value={type} onChange={(e) => setType(e.target.value as InvoiceType)}>
              <option value="invoice">Factura</option>
              <option value="quote">Presupuesto</option>
            </select>
          </label>
          <label>
            Cliente
            <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Sin cliente asociado</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name ? `${c.name} (${c.phone})` : c.phone}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fecha de emisión
            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
          </label>
          <label>
            Fecha de vencimiento
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
          <label>
            IVA (%)
            <input value={taxRate} onChange={(e) => setTaxRate(e.target.value)} inputMode="decimal" />
          </label>
          <label>
            Notas
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
          </label>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <div className="page__header" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Líneas</span>
            <button type="button" className="btn btn--sm" onClick={handleAddItem}>
              + Añadir línea
            </button>
          </div>

          {items.map((item, index) => (
            <div className="form-grid" key={index} style={{ marginBottom: '0.6rem' }}>
              <label>
                Servicio (opcional)
                <select value={item.serviceId} onChange={(e) => handleServicePick(index, e.target.value)}>
                  <option value="">Línea libre</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Descripción
                <input
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  placeholder="Manicura semipermanente"
                />
              </label>
              <label>
                Cantidad
                <input value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} inputMode="decimal" />
              </label>
              <label>
                Precio unitario (€)
                <input value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} inputMode="decimal" />
              </label>
              {items.length > 1 && (
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleRemoveItem(index)}>
                  Eliminar línea
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mini-list" style={{ marginTop: '0.5rem' }}>
          <div className="mini-list__item">
            <span>Subtotal</span>
            <span>{formatEuros(subtotalCents)}</span>
          </div>
          <div className="mini-list__item">
            <span>IVA ({taxRateValue || 0}%)</span>
            <span>{formatEuros(taxCents)}</span>
          </div>
          <div className="mini-list__item">
            <strong>Total</strong>
            <strong>{formatEuros(totalCents)}</strong>
          </div>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
    </Modal>
  )
}
