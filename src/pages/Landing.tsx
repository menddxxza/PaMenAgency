import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PricingTable } from '@/components/billing/PricingTable'

const PROBLEMS = [
  {
    title: 'Citas que se pierden',
    desc: 'Un cliente escribe por WhatsApp fuera de horario y, si nadie contesta a tiempo, se va con la competencia.',
  },
  {
    title: 'Clientes que no llegan',
    desc: 'Sin un recordatorio automático, una parte de tu agenda se cae cada semana por olvido, y esas horas no se recuperan.',
  },
  {
    title: 'Horas perdidas en tareas manuales',
    desc: 'Agendar a mano, buscar el historial de un cliente o armar una factura te resta tiempo que deberías pasar atendiendo.',
  },
]

const PILLARS = [
  {
    title: 'Bot de WhatsApp con IA',
    desc: 'Responde preguntas frecuentes y agenda citas solo, las 24 horas, con el tono de tu negocio.',
    featured: true,
  },
  {
    title: 'Recordatorios automáticos',
    desc: 'Antes de cada cita, el sistema le escribe al cliente para confirmar. Menos ausencias, más agenda ocupada.',
  },
  {
    title: 'Agenda centralizada',
    desc: 'Todas las citas —del bot o manuales— en un único calendario, con estados claros y filtros rápidos.',
  },
  {
    title: 'Facturación',
    desc: 'Generá facturas numeradas ligadas a cada cliente y servicio, sin salir del panel.',
  },
  {
    title: 'Inventario',
    desc: 'Controlá stock y pedidos a proveedores para no quedarte sin lo que necesitás para atender.',
  },
  {
    title: 'Multi-negocio',
    desc: 'Gestioná varios locales —o los de tus clientes, si trabajás como agencia— desde una sola cuenta.',
  },
]

const PROCESS = [
  {
    number: '1',
    title: 'Conectás tu WhatsApp',
    desc: 'Vinculamos el número de WhatsApp Business de tu negocio con Atiende. Sin cambiar de número, sin apps extra.',
  },
  {
    number: '2',
    title: 'El bot atiende y agenda solo',
    desc: 'Contesta las dudas más comunes y reserva citas según tu disponibilidad real, en cualquier momento del día.',
  },
  {
    number: '3',
    title: 'Vos controlás todo desde el panel',
    desc: 'Citas, clientes, conversaciones, facturación e inventario en un solo lugar. Tomás el chat cuando quieras.',
  },
]

const CASES = [
  {
    id: 'clinicas',
    label: 'Clínicas',
    title: 'Clínicas y consultas',
    desc: 'El bot confirma turnos, recuerda a los pacientes su cita del día siguiente y resuelve dudas sobre horarios y ubicación, sin que la recepción tenga que estar pendiente del móvil todo el día.',
  },
  {
    id: 'salones',
    label: 'Peluquerías y salones',
    title: 'Peluquerías y salones de belleza',
    desc: 'Los clientes reservan su próximo corte o tratamiento por WhatsApp a cualquier hora, y los recordatorios automáticos reducen las sillas vacías por olvido.',
  },
  {
    id: 'talleres',
    label: 'Talleres',
    title: 'Talleres y servicios técnicos',
    desc: 'Agendá revisiones y entregas, llevá el historial de cada cliente y generá la factura del servicio sin pasar por hojas de cálculo sueltas.',
  },
]

export function Landing() {
  const [activeCase, setActiveCase] = useState(CASES[0].id)
  const currentCase = CASES.find((c) => c.id === activeCase) ?? CASES[0]

  return (
    <div className="landing">
      <nav className="landing__nav">
        <span className="landing__nav-brand">Atiende</span>
        <div className="landing__nav-links">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#casos">Casos de uso</a>
          <a href="#precios">Precios</a>
          <Link to="/login">Iniciar sesión</Link>
          <Link to="/signup" className="btn btn--primary" style={{ textDecoration: 'none' }}>
            Empezar
          </Link>
        </div>
      </nav>

      <header className="landing__hero">
        <div className="landing__hero-copy">
          <h1>El panel de citas y WhatsApp para tu negocio</h1>
          <p>
            Atiende conecta tu WhatsApp Business con un bot de IA que agenda citas solo, y te da un panel para
            verlo y controlarlo todo: agenda, clientes, facturación e inventario.
          </p>
          <div className="landing__hero-actions">
            <Link to="/signup" className="btn btn--primary" style={{ textDecoration: 'none' }}>
              Empezar gratis
            </Link>
            <a href="#precios" className="btn btn--ghost">
              Ver planes
            </a>
          </div>
        </div>

        <div className="chat-mock" aria-hidden="true">
          <div className="chat-mock__header">
            <span className="chat-mock__dot" />
            <span>Tu negocio · WhatsApp</span>
          </div>
          <div className="chat-mock__body">
            <div className="chat-mock__bubble chat-mock__bubble--client">Hola, ¿tenéis hueco mañana por la tarde?</div>
            <div className="chat-mock__bubble chat-mock__bubble--bot">
              ¡Claro! Tengo libre a las 17:30 o a las 19:00, ¿cuál prefieres?
            </div>
            <div className="chat-mock__bubble chat-mock__bubble--client">A las 17:30 perfecto</div>
            <div className="chat-mock__bubble chat-mock__bubble--bot">
              Cita confirmada para mañana a las 17:30 ✓ Te recuerdo un día antes.
            </div>
          </div>
        </div>
      </header>

      <section className="landing__section landing__problem">
        <h2>Lo que le pasa a un negocio sin esto</h2>
        <div className="problem-grid">
          {PROBLEMS.map((p) => (
            <div className="problem-card" key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing__section" id="como-funciona">
        <h2>Todo lo que necesita tu negocio</h2>
        <div className="solution-grid">
          {PILLARS.map((f) => (
            <div className={`solution-card ${f.featured ? 'solution-card--featured' : ''}`} key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing__section landing__process">
        <h2>Cómo funciona</h2>
        <div className="process-steps">
          {PROCESS.map((step) => (
            <div className="process-step" key={step.number}>
              <span className="process-step__number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing__section landing__cases" id="casos">
        <h2>Pensado para tu tipo de negocio</h2>
        <div className="cases-tabs" role="tablist">
          {CASES.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={activeCase === c.id}
              className={`cases-tab ${activeCase === c.id ? 'is-active' : ''}`}
              onClick={() => setActiveCase(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="cases-panel">
          <h3>{currentCase.title}</h3>
          <p>{currentCase.desc}</p>
        </div>
      </section>

      <section className="landing__section" id="precios">
        <h2>Planes simples, sin sorpresas</h2>
        <PricingTable ctaLabel={() => 'Empezar'} onSelect={() => (window.location.href = '/signup')} />
      </section>

      <footer className="landing__footer">© {new Date().getFullYear()} Atiende</footer>
    </div>
  )
}
