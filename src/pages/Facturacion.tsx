import { useMemo, useState } from 'react'
import { useInvoices } from '@/hooks/useInvoices'
import { useClients } from '@/hooks/useClients'
import { useToast } from '@/context/ToastContext'
import { usePageTitle } from '@/hooks/usePageTitle'
import { updateInvoiceStatus } from '@/lib/mutations'
import { NewInvoiceModal } from '@/components/facturacion/NewInvoiceModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonRows } from '@/components/ui/Skeleton'
import { IconFacturacion } from '@/components/layout/NavIcons'
import type { InvoiceStatus, InvoiceType } from '@/types/database.types'

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  paid: 'Cobrada',
  cancelled: 'Cancelada',
}

const TYPE_LABEL: Record<InvoiceType, string> = {
  quote: 'Presupuesto',
  invoice: 'Factura',
}

function formatEuros(cents: number): string {
  return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

export function Facturacion() {
  usePageTitle('Facturación')
  const { invoices, loading, refresh } = useInvoices()
  const { clients } = useClients()
  const { showToast } = useToast()
  const [typeFilter, setTypeFilter] = useState<InvoiceType | 'all'>('all')
  const [showNewModal, setShowNewModal] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toCancel, setToCancel] = useState<string | null>(null)

  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients])
  const filtered = invoices.filter((i) => typeFilter === 'all' || i.type === typeFilter)

  const pendingCents = invoices
    .filter((i) => i.status === 'sent')
    .reduce((sum, i) => sum + i.total_cents, 0)

  async function handleStatusChange(id: string, status: InvoiceStatus) {
    setBusyId(id)
    try {
      await updateInvoiceStatus(id, status)
      await refresh()
      showToast(`Documento marcado como "${STATUS_LABEL[status].toLowerCase()}"`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo actualizar el documento', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const cancelTarget = toCancel ? invoices.find((i) => i.id === toCancel) : null

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1>Facturación</h1>
          <p>Presupuestos, facturas y cobros pendientes del negocio.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowNewModal(true)}>
          + Nuevo documento
        </button>
      </div>

      <div className="card">
        <div className="mini-list">
          <div className="mini-list__item">
            <span>Cobros pendientes</span>
            <strong>{formatEuros(pendingCents)}</strong>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="filter-row">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as InvoiceType | 'all')}>
            <option value="all">Presupuestos y facturas</option>
            <option value="invoice">Solo facturas</option>
            <option value="quote">Solo presupuestos</option>
          </select>
        </div>

        {loading && <SkeletonRows rows={5} />}

        {!loading && filtered.length === 0 && (
          <EmptyState
            icon={<IconFacturacion />}
            title={invoices.length === 0 ? 'Todavía no has emitido nada' : 'Nada con este filtro'}
            description={
              invoices.length === 0
                ? 'Crea presupuestos y facturas ligados a tus clientes y servicios, con numeración correlativa automática por año.'
                : 'Cambia el filtro para ver el resto de documentos.'
            }
            action={
              invoices.length === 0 ? (
                <button className="btn btn--primary" onClick={() => setShowNewModal(true)}>
                  + Nuevo documento
                </button>
              ) : (
                <button className="btn btn--sm" onClick={() => setTypeFilter('all')}>
                  Ver todos
                </button>
              )
            }
          />
        )}

        {!loading && filtered.length > 0 && (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Tipo</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((invoice) => {
                  const client = invoice.client_id ? clientById.get(invoice.client_id) : null
                  return (
                    <tr key={invoice.id}>
                      <td>{invoice.number}</td>
                      <td>{TYPE_LABEL[invoice.type]}</td>
                      <td>{client?.name || client?.phone || '—'}</td>
                      <td>{new Date(invoice.issue_date).toLocaleDateString('es-ES')}</td>
                      <td>{formatEuros(invoice.total_cents)}</td>
                      <td>
                        <span className={`badge badge--${invoice.status}`}>{STATUS_LABEL[invoice.status]}</span>
                      </td>
                      <td>
                        <div className="table__actions">
                          {invoice.status === 'draft' && (
                            <button
                              className="btn btn--sm"
                              disabled={busyId === invoice.id}
                              onClick={() => handleStatusChange(invoice.id, 'sent')}
                            >
                              Marcar enviada
                            </button>
                          )}
                          {invoice.status === 'sent' && (
                            <button
                              className="btn btn--sm"
                              disabled={busyId === invoice.id}
                              onClick={() => handleStatusChange(invoice.id, 'paid')}
                            >
                              Marcar cobrada
                            </button>
                          )}
                          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                            <button
                              className="btn btn--sm btn--danger"
                              disabled={busyId === invoice.id}
                              onClick={() => setToCancel(invoice.id)}
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNewModal && <NewInvoiceModal onClose={() => setShowNewModal(false)} onCreated={refresh} />}

      {toCancel && (
        <ConfirmDialog
          title="Cancelar documento"
          message={`Se cancelará ${cancelTarget ? `${TYPE_LABEL[cancelTarget.type].toLowerCase()} ${cancelTarget.number}` : 'este documento'}. El número queda reservado y no se reutiliza, para no romper la numeración correlativa.`}
          confirmLabel="Sí, cancelar"
          danger
          onCancel={() => setToCancel(null)}
          onConfirm={async () => {
            await handleStatusChange(toCancel, 'cancelled')
            setToCancel(null)
          }}
        />
      )}
    </div>
  )
}
