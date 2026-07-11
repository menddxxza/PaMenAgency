import { useEffect, useState } from 'react'
import { useTenant } from '@/context/TenantContext'
import { useBusinessSettings } from '@/hooks/useBusiness'
import { useServices } from '@/hooks/useServices'
import { updateBotConfig, updateBusinessSettings, toggleServiceActive } from '@/lib/mutations'
import { NewServiceModal } from '@/components/configuracion/NewServiceModal'
import type { BotTone } from '@/types/database.types'

export function Configuracion() {
  const { activeBusinessId } = useTenant()
  const { business, botConfig, loading, refresh } = useBusinessSettings()
  const { services, refresh: refreshServices } = useServices()

  const [businessName, setBusinessName] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [timezone, setTimezone] = useState('Europe/Madrid')
  const [tone, setTone] = useState<BotTone>('cercano')
  const [greeting, setGreeting] = useState('')
  const [savingBusiness, setSavingBusiness] = useState(false)
  const [savingBot, setSavingBot] = useState(false)
  const [showNewService, setShowNewService] = useState(false)
  const [saved, setSaved] = useState<'business' | 'bot' | null>(null)

  useEffect(() => {
    if (business) {
      setBusinessName(business.name)
      setWhatsappNumber(business.whatsapp_number ?? '')
      setTimezone(business.timezone)
    }
    if (botConfig) {
      setTone(botConfig.tone)
      setGreeting(botConfig.greeting_message)
    }
  }, [business, botConfig])

  async function handleSaveBusiness() {
    if (!activeBusinessId) return
    setSavingBusiness(true)
    await updateBusinessSettings(activeBusinessId, { name: businessName, whatsappNumber: whatsappNumber || null, timezone })
    setSavingBusiness(false)
    setSaved('business')
    setTimeout(() => setSaved(null), 2000)
  }

  async function handleSaveBot() {
    if (!activeBusinessId) return
    setSavingBot(true)
    await updateBotConfig(activeBusinessId, { tone, greetingMessage: greeting })
    setSavingBot(false)
    setSaved('bot')
    setTimeout(() => setSaved(null), 2000)
  }

  if (loading || !activeBusinessId) return <div className="page">Cargando…</div>

  return (
    <div className="page">
      <h1>Configuración</h1>

      <div className="card">
        <h2 className="card__title">Datos del negocio</h2>
        <div className="form-grid">
          <label>
            Nombre
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </label>
          <label>
            Número de WhatsApp
            <input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+34 600 000 000" />
          </label>
          <label>
            Zona horaria
            <input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Europe/Madrid" />
          </label>
        </div>
        <div className="modal__footer" style={{ justifyContent: 'flex-start', marginTop: '1rem' }}>
          <button className="btn btn--primary" onClick={handleSaveBusiness} disabled={savingBusiness}>
            {savingBusiness ? 'Guardando…' : 'Guardar datos del negocio'}
          </button>
          {saved === 'business' && <span style={{ color: 'var(--status-good)', fontSize: '0.85rem' }}>Guardado ✓</span>}
        </div>
      </div>

      <div className="card">
        <h2 className="card__title">Configuración del bot</h2>
        <div className="form-grid">
          <label>
            Tono
            <select value={tone} onChange={(e) => setTone(e.target.value as BotTone)}>
              <option value="cercano">Cercano</option>
              <option value="profesional">Profesional</option>
              <option value="directo">Directo</option>
              <option value="divertido">Divertido</option>
            </select>
          </label>
          <label>
            Mensaje de bienvenida
            <textarea rows={3} value={greeting} onChange={(e) => setGreeting(e.target.value)} />
          </label>
        </div>
        <div className="modal__footer" style={{ justifyContent: 'flex-start', marginTop: '1rem' }}>
          <button className="btn btn--primary" onClick={handleSaveBot} disabled={savingBot}>
            {savingBot ? 'Guardando…' : 'Guardar configuración del bot'}
          </button>
          {saved === 'bot' && <span style={{ color: 'var(--status-good)', fontSize: '0.85rem' }}>Guardado ✓</span>}
        </div>
      </div>

      <div className="card">
        <div className="page__header" style={{ marginBottom: '0.75rem' }}>
          <h2 className="card__title" style={{ marginBottom: 0 }}>
            Servicios
          </h2>
          <button className="btn btn--sm" onClick={() => setShowNewService(true)}>
            + Nuevo servicio
          </button>
        </div>

        {services.length === 0 && <p className="empty-state">Todavía no hay servicios configurados.</p>}

        {services.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Duración</th>
                <th>Activo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{(s.price_cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                  <td>{s.duration_min} min</td>
                  <td>{s.active ? 'Sí' : 'No'}</td>
                  <td>
                    <div className="table__actions">
                      <button
                        className="btn btn--sm"
                        onClick={async () => {
                          await toggleServiceActive(s.id, !s.active)
                          refreshServices()
                        }}
                      >
                        {s.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showNewService && (
        <NewServiceModal
          businessId={activeBusinessId}
          onClose={() => setShowNewService(false)}
          onCreated={() => {
            refreshServices()
            refresh()
          }}
        />
      )}
    </div>
  )
}
