import { useState, type FormEvent } from 'react'
import { upsertClient, updateClientNotes } from '@/lib/mutations'
import { Modal } from '@/components/ui/Modal'

interface Props {
  businessId: string
  onClose: () => void
  onCreated: () => void
}

// Los clientes se dan de alta solos al escribir por WhatsApp o al
// reservarles una cita, pero no había ninguna forma de añadir a mano a
// alguien que llega por teléfono, en persona, o que ya era cliente antes
// de usar Atiende.
export function NewClientModal({ businessId, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const phoneValue = phone.trim()
    if (!/^[\d +().-]{6,}$/.test(phoneValue)) {
      setError('Introduce un teléfono válido (solo dígitos, espacios, +, - y paréntesis)')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const client = await upsertClient(businessId, phoneValue, name.trim() || undefined)
      if (notes.trim()) {
        await updateClientNotes(client.id, notes.trim())
      }
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el cliente')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Nuevo cliente"
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting || !phone}>
            {submitting ? 'Guardando…' : 'Crear cliente'}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <label>
          Nombre
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Opcional" />
        </label>
        <label>
          Teléfono
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+34 600 000 000" />
        </label>
        <label>
          Notas
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
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
