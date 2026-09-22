import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => Promise<void> | void
  onCancel: () => void
}

// Cancelar la cita de un cliente o un pedido a proveedor eran acciones de un
// solo clic, sin vuelta atrás y sin aviso. Este diálogo es el freno.
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  const [working, setWorking] = useState(false)

  async function handleConfirm() {
    setWorking(true)
    try {
      await onConfirm()
    } finally {
      setWorking(false)
    }
  }

  return (
    <Modal
      title={title}
      variant="confirm"
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn" onClick={onCancel} disabled={working}>
            Volver
          </button>
          <button
            type="button"
            className={`btn ${danger ? 'btn--destructive' : 'btn--primary'}`}
            onClick={handleConfirm}
            disabled={working}
          >
            {working ? 'Un momento…' : confirmLabel}
          </button>
        </>
      }
    >
      {message}
    </Modal>
  )
}
