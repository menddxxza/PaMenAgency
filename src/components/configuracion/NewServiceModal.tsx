import { useState, type FormEvent } from 'react'
import { createService } from '@/lib/mutations'
import { Modal } from '@/components/ui/Modal'

interface Props {
  businessId: string
  onClose: () => void
  onCreated: () => void
}

export function NewServiceModal({ businessId, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('30')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const priceValue = parseFloat(price.replace(',', '.'))
    const durationValue = parseInt(duration, 10)
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setError('Introduce un precio válido, mayor que 0')
      return
    }
    if (!Number.isFinite(durationValue) || durationValue <= 0) {
      setError('Introduce una duración válida, mayor que 0')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await createService({
        businessId,
        name,
        priceCents: Math.round(priceValue * 100),
        durationMin: durationValue,
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el servicio')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Nuevo servicio"
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting || !name || !price}>
            {submitting ? 'Guardando…' : 'Crear servicio'}
          </button>
        </>
      }
    >
        <div className="form-grid">
          <label>
            Nombre
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Manicura" />
          </label>
          <label>
            Precio (€)
            <input value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="18.00" inputMode="decimal" />
          </label>
          <label>
            Duración (min)
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              min={5}
              step={5}
            />
          </label>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
    </Modal>
  )
}
