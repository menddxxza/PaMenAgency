import { useEffect, useState, type FormEvent } from 'react'
import { useTenant } from '@/context/TenantContext'
import { useToast } from '@/context/ToastContext'
import { listMembers, inviteMember, removeMember, type TeamMember } from '@/lib/team'
import type { BusinessRole } from '@/types/database.types'

const ROLE_LABEL: Record<BusinessRole, string> = {
  owner: 'Dueño/a',
  staff: 'Staff',
  agency: 'Agencia',
}

export function TeamSection({ businessId }: { businessId: string }) {
  const { showToast } = useToast()
  const { memberships } = useTenant()
  const myRole = memberships.find((m) => m.businessId === businessId)?.role
  const isOwner = myRole === 'owner'

  const [members, setMembers] = useState<TeamMember[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<BusinessRole>('staff')
  const [inviting, setInviting] = useState(false)

  async function refresh() {
    setLoading(true)
    try {
      const data = await listMembers(businessId)
      setMembers(data)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo cargar el equipo', 'error')
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId])

  async function handleInvite(e: FormEvent) {
    e.preventDefault()
    setInviting(true)
    try {
      await inviteMember(businessId, email.trim(), role)
      showToast(`Invitación enviada a ${email.trim()}`)
      setEmail('')
      refresh()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo invitar', 'error')
    } finally {
      setInviting(false)
    }
  }

  async function handleRemove(memberId: string) {
    try {
      await removeMember(businessId, memberId)
      showToast('Miembro eliminado')
      refresh()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo eliminar', 'error')
    }
  }

  return (
    <div className="card">
      <h2 className="card__title">Equipo</h2>

      {loading && <p className="empty-state">Cargando…</p>}

      {!loading && members && members.length > 0 && (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Rol</th>
                {isOwner && <th></th>}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>{m.email}</td>
                  <td>{ROLE_LABEL[m.role]}</td>
                  {isOwner && (
                    <td>
                      <div className="table__actions">
                        <button className="btn btn--sm btn--danger" onClick={() => handleRemove(m.id)}>
                          Quitar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isOwner ? (
        <form className="form-grid" onSubmit={handleInvite} style={{ marginTop: '1rem' }}>
          <div className="filter-row" style={{ alignItems: 'flex-end' }}>
            <label style={{ flex: 1 }}>
              Invitar por email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="persona@ejemplo.com"
              />
            </label>
            <label>
              Rol
              <select value={role} onChange={(e) => setRole(e.target.value as BusinessRole)}>
                <option value="staff">Staff</option>
                <option value="owner">Dueño/a</option>
              </select>
            </label>
            <button type="submit" className="btn btn--primary" disabled={inviting}>
              {inviting ? 'Invitando…' : 'Invitar'}
            </button>
          </div>
        </form>
      ) : (
        <p className="login__hint" style={{ marginTop: '1rem' }}>
          Solo el dueño/a del negocio puede invitar o quitar personas.
        </p>
      )}
    </div>
  )
}
