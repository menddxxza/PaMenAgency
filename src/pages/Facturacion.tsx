import { useMemo, useState } from 'react'
import { useInvoices } from '@/hooks/useInvoices'
import { useClients } from '@/hooks/useClients'
import { updateInvoiceStatus } from '@/lib/mutations'
import { NewInvoiceModal } from '@/components/facturacion/NewInvoiceModal'
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
  const { invoices, loading, refresh } = useInvoices()
  const { clients } = useClients()
  const [typeFilter, setTypeFilter] = useState<InvoiceType | 'all'>('all')
  const [showNewModal, setShowNewModal] = useState(false)

  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients])
  const filtered = invoices.filter((i) => typeFilter === 'all' || i.type === typeFilter)

  const pendingCents = invoices
    .filter((i) => i.status === 'sent')
    .reduce((sum, i) => sum + i.total_cents, 0)

  async function handleStatusChange(id: string, status: InvoiceStatus) {
    await updateInvoiceStatus(id, status)
    refresh()
  }

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

        {loading && <p className="empty-state">Cargando…</p>}

        {!loading && filtered.length === 0 && <p className="empty-state">No hay documentos todavía.</p>}

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
                            <button className="btn btn--sm" onClick={() => handleStatusChange(invoice.id, 'sent')}>
                              Marcar enviada
                            </button>
                          )}
                          {invoice.status === 'sent' && (
                            <button className="btn btn--sm" onClick={() => handleStatusChange(invoice.id, 'paid')}>
                              Marcar cobrada
                            </button>
                          )}
                          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                            <button
                              className="btn btn--sm btn--danger"
                              onClick={() => handleStatusChange(invoice.id, 'cancelled')}
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
    </div>
  )
}
