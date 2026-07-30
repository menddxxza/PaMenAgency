import { useEffect, useState } from 'react'
import { useTenant } from '@/context/TenantContext'
import { useToast } from '@/context/ToastContext'
import { useBusinessSettings } from '@/hooks/useBusiness'
import { useServices } from '@/hooks/useServices'
import { updateBotConfig, updateBusinessSettings, toggleServiceActive } from '@/lib/mutations'
import { NewServiceModal } from '@/components/configuracion/NewServiceModal'
import { TeamSection } from '@/components/configuracion/TeamSection'
import { BillingSection } from '@/components/configuracion/BillingSection'
import { usePageTitle } from '@/hooks/usePageTitle'
import { FullPageLoader } from '@/components/layout/FullPageLoader'
import type { BotTone, Faq } from '@/types/database.types'

export function Configuracion() {
  usePageTitle('Configuración')
  const { activeBusinessId } = useTenant()
  const { showToast } = useToast()
  const { business, botConfig, loading, refresh } = useBusinessSettings()
  const { services, refresh: refreshServices } = useServices()

  const [businessName, setBusinessName] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [timezone, setTimezone] = useState('Europe/Madrid')
  const [tone, setTone] = useState<BotTone>('cercano')
  const [greeting, setGreeting] = useState('')
  const [reminderHoursBefore, setReminderHoursBefore] = useState(24)
  const [faqAutoReply, setFaqAutoReply] = useState(false)
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [savingBusiness, setSavingBusiness] = useState(false)
  const [savingBot, setSavingBot] = useState(false)
  const [showNewService, setShowNewService] = useState(false)

  useEffect(() => {
    if (business) {
      setBusinessName(business.name)
      setWhatsappNumber(business.whatsapp_number ?? '')
      setTimezone(business.timezone)
    }
    if (botConfig) {
      setTone(botConfig.tone)
      setGreeting(botConfig.greeting_message)
      setReminderHoursBefore(botConfig.reminder_hours_before)
      setFaqAutoReply(botConfig.faq_auto_reply)
      setFaqs(botConfig.knowledge_base?.faqs ?? [])
    }
  }, [business, botConfig])

  async function handleSaveBusiness() {
    if (!activeBusinessId) return
    setSavingBusiness(true)
    try {
      await updateBusinessSettings(activeBusinessId, { name: businessName, whatsappNumber: whatsappNumber || null, timezone })
      showToast('Datos del negocio guardados')
    } catch {
      showToast('No se pudo guardar', 'error')
    } finally {
      setSavingBusiness(false)
    }
  }

  async function handleSaveBot() {
    if (!activeBusinessId) return
    setSavingBot(true)
    try {
      await updateBotConfig(activeBusinessId, {
        tone,
        greetingMessage: greeting,
        reminderHoursBefore,
        faqAutoReply,
        knowledgeBase: { faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()) },
      })
      showToast('Configuración del bot guardada')
    } catch {
      showToast('No se pudo guardar', 'error')
    } finally {
      setSavingBot(false)
    }
  }

  function handleFaqChange(index: number, field: keyof Faq, value: string) {
    setFaqs((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)))
  }

  function handleAddFaq() {
    setFaqs((prev) => [...prev, { question: '', answer: '' }])
  }

  function handleRemoveFaq(index: number) {
    setFaqs((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleToggleService(id: string, active: boolean) {
    try {
      await toggleServiceActive(id, active)
      await refreshServices()
      showToast(active ? 'Servicio activado' : 'Servicio desactivado')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo cambiar el servicio', 'error')
    }
  }

  if (loading || !activeBusinessId) return <FullPageLoader />

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
          <label>
            Antelación del recordatorio de cita
            <select value={reminderHoursBefore} onChange={(e) => setReminderHoursBefore(Number(e.target.value))}>
              <option value={2}>2 horas antes</option>
              <option value={4}>4 horas antes</option>
              <option value={24}>24 horas antes</option>
              <option value={48}>48 horas antes</option>
            </select>
          </label>
          <label className="checkbox-field">
            <input type="checkbox" checked={faqAutoReply} onChange={(e) => setFaqAutoReply(e.target.checked)} />
            Responder automáticamente con IA a preguntas frecuentes por WhatsApp
          </label>
        </div>

        <div style={{ marginTop: '1.25rem' }}>
          <div className="page__header" style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Base de conocimiento (preguntas frecuentes)
            </span>
            <button type="button" className="btn btn--sm" onClick={handleAddFaq}>
              + Añadir pregunta
            </button>
          </div>

          {faqs.length === 0 && <p className="empty-state">Sin preguntas frecuentes configuradas.</p>}

          {faqs.map((faq, index) => (
            <div className="form-grid" key={index} style={{ marginBottom: '0.75rem' }}>
              <label>
                Pregunta
                <input
                  value={faq.question}
                  onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                  placeholder="¿Cuál es el horario?"
                />
              </label>
              <label>
                Respuesta
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                  placeholder="Abrimos de lunes a viernes de 9:00 a 20:00."
                />
              </label>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleRemoveFaq(index)}>
                Eliminar pregunta
              </button>
            </div>
          ))}
        </div>

        <div className="modal__footer" style={{ justifyContent: 'flex-start', marginTop: '1rem' }}>
          <button className="btn btn--primary" onClick={handleSaveBot} disabled={savingBot}>
            {savingBot ? 'Guardando…' : 'Guardar configuración del bot'}
          </button>
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

        {services.length === 0 && (
          <p className="empty-state">
            Todavía no hay servicios configurados. El bot los necesita para poder ofrecer horarios y precios al reservar.
          </p>
        )}

        {services.length > 0 && (
          <div className="table-scroll">
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
                  <td>
                    <span className={`badge badge--${s.active ? 'confirmed' : 'closed'}`}>
                      {s.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="table__actions">
                      <button className="btn btn--sm" onClick={() => handleToggleService(s.id, !s.active)}>
                        {s.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      <TeamSection businessId={activeBusinessId} />

      <BillingSection businessId={activeBusinessId} />

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
