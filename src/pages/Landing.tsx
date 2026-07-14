import { Link } from 'react-router-dom'
import { PricingTable } from '@/components/billing/PricingTable'

const FEATURES = [
  { title: 'Bot de WhatsApp con IA', desc: 'Responde consultas y agenda citas automáticamente, 24/7.' },
  { title: 'Agenda de citas', desc: 'Confirmá, cancelá y llevá el control de cada cita desde un solo lugar.' },
  { title: 'Conversaciones en vivo', desc: 'Tomá el control de cualquier chat cuando el bot no alcance.' },
  { title: 'Estadísticas claras', desc: 'Cuántas citas, cuántas conversaciones, cuánto convierte tu bot.' },
  { title: 'Multi-negocio', desc: 'Gestioná varios negocios (o los de tus clientes, si sos agencia) desde una cuenta.' },
  { title: 'Instalable como app', desc: 'Funciona como PWA: se instala en el celular, sin pasar por una tienda de apps.' },
]

export function Landing() {
  return (
    <div className="landing">
      <nav className="landing__nav">
        <span className="landing__nav-brand">Atiende</span>
        <div className="landing__nav-links">
          <Link to="/login">Iniciar sesión</Link>
          <Link to="/signup" className="btn btn--primary" style={{ textDecoration: 'none' }}>
            Empezar
          </Link>
        </div>
      </nav>

      <header className="landing__hero">
        <h1>El panel de citas y WhatsApp para tu negocio</h1>
        <p>
          Atiende conecta tu WhatsApp Business con un bot de IA que agenda citas solo, y te da un panel para
          verlo y controlarlo todo.
        </p>
        <Link to="/signup" className="btn btn--primary" style={{ textDecoration: 'none' }}>
          Empezar ahora
        </Link>
      </header>

      <section className="landing__section">
        <h2>Todo lo que necesita tu negocio</h2>
        <div className="landing__features">
          {FEATURES.map((f) => (
            <div className="landing__feature" key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
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
