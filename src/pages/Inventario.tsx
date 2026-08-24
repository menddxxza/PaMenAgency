import { useMemo, useState } from 'react'
import { useInventory } from '@/hooks/useInventory'
import { useSupplierOrders } from '@/hooks/useSupplierOrders'
import { receiveSupplierOrder, updateSupplierOrderStatus } from '@/lib/mutations'
import { InventoryItemModal } from '@/components/inventario/InventoryItemModal'
import { NewSupplierOrderModal } from '@/components/inventario/NewSupplierOrderModal'
import { useToast } from '@/context/ToastContext'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonRows } from '@/components/ui/Skeleton'
import { IconInventario } from '@/components/layout/NavIcons'
import type { Database, SupplierOrderStatus } from '@/types/database.types'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

const ORDER_STATUS_LABEL: Record<SupplierOrderStatus, string> = {
  pending: 'Pendiente',
  received: 'Recibido',
  cancelled: 'Cancelado',
}

const EXPIRY_WARNING_DAYS = 30

function daysUntil(dateStr: string): number {
  const diffMs = new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0)
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function Inventario() {
  usePageTitle('Inventario')
  const { items, loading, refresh } = useInventory()
  const { orders, loading: loadingOrders, refresh: refreshOrders } = useSupplierOrders()
  const { showToast } = useToast()
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [showNewItem, setShowNewItem] = useState(false)
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [toCancelOrder, setToCancelOrder] = useState<string | null>(null)

  const itemById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])
  const lowStockCount = items.filter((i) => i.quantity <= i.min_quantity).length
  const expiringCount = items.filter((i) => i.expiry_date && daysUntil(i.expiry_date) <= EXPIRY_WARNING_DAYS).length
  const pendingOrders = orders.filter((o) => o.status === 'pending')

  async function handleReceiveOrder(orderId: string) {
    try {
      await receiveSupplierOrder(orderId)
      refreshOrders()
      refresh()
      showToast('Pedido recibido, stock actualizado')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo recibir el pedido', 'error')
    }
  }

  async function handleCancelOrder(orderId: string) {
    try {
      await updateSupplierOrderStatus(orderId, 'cancelled')
      await refreshOrders()
      showToast('Pedido cancelado')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo cancelar el pedido', 'error')
    }
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1>Inventario</h1>
          <p>Material disponible, alertas de stock bajo y control de caducidades.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowNewItem(true)}>
          + Nuevo artículo
        </button>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-card__value">{items.length}</span>
          <span className="stat-card__label">Artículos</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{lowStockCount}</span>
          <span className="stat-card__label">Con stock bajo</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{expiringCount}</span>
          <span className="stat-card__label">Caducan pronto</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{pendingOrders.length}</span>
          <span className="stat-card__label">Pedidos pendientes</span>
        </div>
      </div>

      <div className="card">
        {loading && <SkeletonRows rows={5} />}
        {!loading && items.length === 0 && (
          <EmptyState
            icon={<IconInventario />}
            title="El inventario está vacío"
            description="Da de alta el material que usas y Atiende te avisará cuando baje del mínimo o esté a punto de caducar."
            action={
              <button className="btn btn--primary" onClick={() => setShowNewItem(true)}>
                + Nuevo artículo
              </button>
            }
          />
        )}

        {!loading && items.length > 0 && (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Artículo</th>
                  <th>Cantidad</th>
                  <th>Mínimo</th>
                  <th>Precio</th>
                  <th>Caducidad</th>
                  <th>Alertas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const lowStock = item.quantity <= item.min_quantity
                  const daysToExpiry = item.expiry_date ? daysUntil(item.expiry_date) : null
                  const expired = daysToExpiry !== null && daysToExpiry < 0
                  const expiringSoon = daysToExpiry !== null && daysToExpiry >= 0 && daysToExpiry <= EXPIRY_WARNING_DAYS
                  return (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>
                        {item.quantity} {item.unit}
                      </td>
                      <td>
                        {item.min_quantity} {item.unit}
                      </td>
                      <td>{item.unit_price != null ? `${item.unit_price.toFixed(2)}€` : '—'}</td>
                      <td>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('es-ES') : '—'}</td>
                      <td>
                        <div className="table__actions">
                          {lowStock && <span className="badge badge--cancelled">Stock bajo</span>}
                          {expired && <span className="badge badge--cancelled">Caducado</span>}
                          {!expired && expiringSoon && <span className="badge badge--pending">Caduca pronto</span>}
                        </div>
                      </td>
                      <td>
                        <button className="btn btn--sm" onClick={() => setEditingItem(item)}>
                          Editar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="page__header" style={{ marginBottom: '0.75rem' }}>
          <h2 className="card__title" style={{ marginBottom: 0 }}>
            Pedidos a proveedores
          </h2>
          <button className="btn btn--sm" onClick={() => setShowNewOrder(true)}>
            + Nuevo pedido
          </button>
        </div>

        {loadingOrders && <SkeletonRows rows={3} />}
        {!loadingOrders && orders.length === 0 && (
          <p className="empty-state">
            Sin pedidos registrados. Al marcar un pedido como recibido, su cantidad se suma al stock automáticamente.
          </p>
        )}

        {!loadingOrders && orders.length > 0 && (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Artículo</th>
                  <th>Cantidad</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.supplier_name}</td>
                    <td>{order.item_id ? itemById.get(order.item_id)?.name ?? '—' : '—'}</td>
                    <td>{order.quantity}</td>
                    <td>{new Date(order.ordered_at).toLocaleDateString('es-ES')}</td>
                    <td>
                      <span className={`badge badge--${order.status === 'received' ? 'paid' : order.status === 'cancelled' ? 'cancelled' : 'pending'}`}>
                        {ORDER_STATUS_LABEL[order.status]}
                      </span>
                    </td>
                    <td>
                      {order.status === 'pending' && (
                        <div className="table__actions">
                          <button className="btn btn--sm" onClick={() => handleReceiveOrder(order.id)}>
                            Marcar recibido
                          </button>
                          <button className="btn btn--sm btn--danger" onClick={() => setToCancelOrder(order.id)}>
                            Cancelar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNewItem && <InventoryItemModal onClose={() => setShowNewItem(false)} onSaved={refresh} />}
      {editingItem && (
        <InventoryItemModal item={editingItem} onClose={() => setEditingItem(null)} onSaved={refresh} />
      )}
      {showNewOrder && <NewSupplierOrderModal onClose={() => setShowNewOrder(false)} onCreated={refreshOrders} />}

      {toCancelOrder && (
        <ConfirmDialog
          title="Cancelar pedido"
          message="El pedido quedará como cancelado y no repondrá stock. No se puede deshacer."
          confirmLabel="Sí, cancelar el pedido"
          danger
          onCancel={() => setToCancelOrder(null)}
          onConfirm={async () => {
            await handleCancelOrder(toCancelOrder)
            setToCancelOrder(null)
          }}
        />
      )}
    </div>
  )
}
