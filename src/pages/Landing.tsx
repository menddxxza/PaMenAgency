import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PricingTable } from '@/components/billing/PricingTable'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useMouseParallax } from '@/hooks/useMouseParallax'
import { TRIAL_DAYS } from '@/lib/plans'

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
    desc: 'Genera facturas numeradas ligadas a cada cliente y servicio, sin salir del panel.',
  },
  {
    title: 'Inventario',
    desc: 'Controla el stock y los pedidos a proveedores para no quedarte sin lo que necesitas para atender.',
  },
  {
    title: 'Multi-negocio',
    desc: 'Gestiona varios locales —o los de tus clientes, si trabajas como agencia— desde una sola cuenta.',
  },
]

const PROCESS = [
  {
    number: '1',
    title: 'Conecta tu WhatsApp',
    desc: 'Vinculamos el número de WhatsApp Business de tu negocio con Atiende. Sin cambiar de número, sin apps extra.',
  },
  {
    number: '2',
    title: 'El bot atiende y agenda solo',
    desc: 'Contesta las dudas más comunes y reserva citas según tu disponibilidad real, en cualquier momento del día.',
  },
  {
    number: '3',
    title: 'Tú controlas todo desde el panel',
    desc: 'Citas, clientes, conversaciones, facturación e inventario en un solo lugar. Tomas el chat cuando quieras.',
  },
]

const CASES = [
  {
    id: 'clinicas',
    label: 'Clínicas',
    title: 'Clínicas y consultas',
    desc: 'El bot confirma citas, recuerda a los pacientes la suya del día siguiente y resuelve dudas sobre horarios y ubicación, sin que la recepción tenga que estar pendiente del móvil todo el día.',
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
    desc: 'Agenda revisiones y entregas, lleva el historial de cada cliente y genera la factura del servicio sin depender de hojas de cálculo sueltas.',
  },
]

// Respuestas a las dudas que frenan la contratación. Todas se corresponden
// con algo que la app ya hace hoy — al cambiar el producto, revisar aquí.
const FAQS = [
  {
    q: `¿Qué incluye la prueba de ${TRIAL_DAYS} días?`,
    a: `El plan Pro completo: citas, clientes, conversaciones, facturación, inventario y estadísticas. No se pide tarjeta y no hay nada que cancelar: si al cabo de ${TRIAL_DAYS} días no eliges plan, el panel deja de abrirse y tus datos se quedan guardados por si vuelves.`,
  },
  {
    q: '¿Tengo que cambiar mi número de WhatsApp?',
    a: 'No. Se conecta el número de WhatsApp Business que ya usas, sin cambiar de número y sin instalar aplicaciones extra.',
  },
  {
    q: '¿Y si el bot no sabe qué contestar?',
    a: 'Puedes tomar el control de cualquier conversación desde el panel y seguir tú el chat, en el mismo hilo y sin que el cliente note el cambio.',
  },
  {
    q: '¿Puedo cambiar de plan más adelante?',
    a: 'Sí, desde la pantalla de Suscripción, cuando quieras. También puedes gestionar los datos de facturación desde ahí.',
  },
  {
    q: '¿Sirve si tengo varios locales?',
    a: 'Sí. Con el plan Agencia gestionas negocios y equipo ilimitados desde una sola cuenta, cambiando de uno a otro desde el propio panel.',
  },
]

export function Landing() {
  const [activeCase, setActiveCase] = useState(CASES[0].id)
  const currentCase = CASES.find((c) => c.id === activeCase) ?? CASES[0]
  const revealRef = useScrollReveal<HTMLDivElement>()
  const heroRef = useMouseParallax<HTMLElement>()

  return (
    <div className="landing" ref={revealRef}>
      <nav className="landing__nav">
        <span className="landing__nav-brand">Atiende</span>

        {/* Separados en dos grupos para que en móvil las secciones bajen a
            una segunda línea y la marca y el botón de alta se queden
            siempre arriba y enteros. */}
        <div className="landing__nav-sections">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#casos">Casos de uso</a>
          <a href="#precios">Precios</a>
          <a href="#faq">Dudas</a>
        </div>

        <div className="landing__nav-actions">
          <Link to="/login">Iniciar sesión</Link>
          <Link to="/signup" className="btn btn--primary" style={{ textDecoration: 'none' }}>
            Empezar
          </Link>
        </div>
      </nav>

      <header className="landing__hero" ref={heroRef}>
        <div className="landing__hero-copy reveal">
          <h1>El panel de citas y WhatsApp para tu negocio</h1>
          <p>
            Atiende conecta tu WhatsApp Business con un bot de IA que agenda citas solo, y te da un panel para
            verlo y controlarlo todo: agenda, clientes, facturación e inventario.
          </p>
          <div className="landing__hero-actions">
            <Link to="/signup" className="btn btn--primary" style={{ textDecoration: 'none' }}>
              Probar {TRIAL_DAYS} días gratis
            </Link>
            <a href="#precios" className="btn btn--ghost">
              Ver planes
            </a>
          </div>
          <p className="landing__hero-note">
            Sin tarjeta. Pruebas el plan Pro completo durante {TRIAL_DAYS} días; si no te convence, no haces nada y
            ya está.
          </p>
        </div>

        <div className="chat-mock reveal" style={{ transitionDelay: '0.12s' }} aria-hidden="true">
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
        <h2 className="reveal">Lo que le pasa a un negocio sin esto</h2>
        <div className="problem-grid">
          {PROBLEMS.map((p, i) => (
            <div className="problem-card reveal" style={{ transitionDelay: `${i * 0.08}s` }} key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing__section" id="como-funciona">
        <h2 className="reveal">Todo lo que necesita tu negocio</h2>
        <div className="solution-grid">
          {PILLARS.map((f, i) => (
            <div
              className={`solution-card reveal ${f.featured ? 'solution-card--featured' : ''}`}
              style={{ transitionDelay: `${i * 0.06}s` }}
              key={f.title}
            >
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing__section landing__process">
        <h2 className="reveal">Cómo funciona</h2>
        <div className="process-steps">
          {PROCESS.map((step, i) => (
            <div className="process-step reveal" style={{ transitionDelay: `${i * 0.1}s` }} key={step.number}>
              <span className="process-step__number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing__section landing__cases" id="casos">
        <h2 className="reveal">Pensado para tu tipo de negocio</h2>
        <div className="cases-tabs reveal" role="tablist">
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
        <div className="cases-panel reveal">
          <h3>{currentCase.title}</h3>
          <p>{currentCase.desc}</p>
        </div>
      </section>

      <section className="landing__section" id="precios">
        <h2 className="reveal">Planes simples, sin sorpresas</h2>
        <p className="landing__section-note reveal">
          Todos empiezan con {TRIAL_DAYS} días gratis del plan Pro completo, sin tarjeta. Eliges plan cuando ya sepas
          si te sirve.
        </p>
        <div className="reveal">
          <PricingTable ctaLabel={() => `Probar ${TRIAL_DAYS} días gratis`} onSelect={() => (window.location.href = '/signup')} />
        </div>
      </section>

      <section className="landing__section" id="faq">
        <h2 className="reveal">Dudas frecuentes</h2>
        <div className="faq-list">
          {FAQS.map((item, i) => (
            <details className="faq-item reveal" style={{ transitionDelay: `${i * 0.06}s` }} key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Tras leer precios y dudas, la página terminaba en el pie: no había
          dónde pulsar sin volver a subir. */}
      <section className="landing__section">
        <div className="final-cta reveal">
          <h2>¿Lo probamos con tu negocio?</h2>
          <p>
            Crea tu cuenta y ten el panel funcionando hoy mismo, con {TRIAL_DAYS} días gratis por delante y sin poner
            una tarjeta. Si tienes dudas antes de empezar, escríbenos y te ayudamos a montarlo.
          </p>
          <div className="final-cta__actions">
            <Link to="/signup" className="btn btn--primary" style={{ textDecoration: 'none' }}>
              Empezar gratis
            </Link>
            <a href="mailto:soporte.Atiende@gmail.com" className="btn">
              Escribirnos
            </a>
          </div>
        </div>
      </section>

      <footer className="landing__footer">
        <span>© {new Date().getFullYear()} Atiende</span>
        <a href="mailto:soporte.Atiende@gmail.com">soporte.Atiende@gmail.com</a>
        <Link to="/privacidad">Política de privacidad</Link>
        <Link to="/cookies">Política de cookies</Link>
        <Link to="/terminos">Términos y condiciones</Link>
      </footer>
    </div>
  )
}
