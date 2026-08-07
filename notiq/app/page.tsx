import Link from 'next/link';
import Logo from '@/components/Logo';
import TablaPrecios from '@/components/TablaPrecios';
import FondoAnimado from '@/components/FondoAnimado';

const PILARES = [
  {
    emoji: '📝',
    titulo: 'Notas que se resumen solas',
    texto:
      'Editor por bloques: texto, títulos, listas, tareas, código y citas. Markdown cuando lo quieres, WYSIWYG cuando no. Y un botón que convierte tres páginas de acta en cinco puntos.',
  },
  {
    emoji: '✅',
    titulo: 'Tareas que salen de tus notas',
    texto:
      '«Extrae las tareas de esta reunión» y aparecen en el tablero con prioridad y fecha. Vista de lista, Kanban o calendario, la que te sirva ese día.',
  },
  {
    emoji: '🤖',
    titulo: 'Un asistente con tu contexto',
    texto:
      'No es un chat genérico: ha leído tus notas y ve tus tareas. «Resume mis notas de esta semana». «¿Qué tengo pendiente para el viernes?».',
  },
];

export default function LandingPage() {
  return (
    <div>
      <FondoAnimado />
      {/*
        Todo el contenido visible va en un envoltorio `relative z-10`: el fondo es
        `fixed` con z-index 0, y sin esto un elemento normal (sin position) pinta
        por detrás de cualquier elemento posicionado con z-index — aunque sea 0 —
        en vez de encima, que es justo el problema que tenía el propio fondo antes
        de tener z-index explícito.
      */}
      <div className="relative z-10">
      <header className="container-page flex items-center justify-between py-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="#precios" className="btn-fantasma hidden sm:inline-flex">
            Precios
          </Link>
          <Link href="/entrar" className="btn-secondary">
            Entrar
          </Link>
          <Link href="/entrar" className="btn-primary">
            Empezar gratis
          </Link>
        </nav>
      </header>

      <main>
        <section className="container-page py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow">Notas · Tareas · Asistente</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
              Escribes la reunión.
              <br />
              Notiq saca las tareas.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink/70">
              Una app de notas con la IA metida en el flujo, no en una pestaña aparte.
              Resume lo que escribes, convierte los acuerdos en tareas y responde a lo
              que le preguntes sobre tu propio material.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/entrar" className="btn-primary px-6 py-3 text-base">
                Empezar gratis
              </Link>
              <Link href="#precios" className="btn-secondary px-6 py-3 text-base">
                Ver precios
              </Link>
            </div>
            <p className="mt-4 text-sm text-ink/50">
              50 notas y 20 operaciones de IA al mes, sin tarjeta.
            </p>
          </div>
        </section>

        <section className="container-page pb-20">
          <div className="grid gap-5 md:grid-cols-3">
            {PILARES.map((pilar) => (
              <article key={pilar.titulo} className="card-flotante p-6">
                <span aria-hidden className="text-2xl">
                  {pilar.emoji}
                </span>
                <h2 className="mt-4 text-lg font-extrabold tracking-tight">{pilar.titulo}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{pilar.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="precios" className="border-t border-ink/10 py-20">
          <div className="container-page">
            <div className="max-w-xl">
              <p className="eyebrow">Precios</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Empieza gratis, paga cuando te haga falta
              </h2>
              <p className="mt-3 text-ink/65">
                El plan gratuito no es una demo con cuenta atrás: es Notiq entero con
                menos volumen.
              </p>
            </div>
            <div className="mt-10">
              <TablaPrecios flotante />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink/10 py-10">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 text-sm text-ink/55">
          <Logo />
          <p>© {new Date().getFullYear()} Notiq</p>
        </div>
      </footer>
      </div>
    </div>
  );
}
