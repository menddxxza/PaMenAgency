import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';
import Logo from '@/components/Logo';
import TablaPrecios from '@/components/TablaPrecios';
import FondoAnimado from '@/components/FondoAnimado';
import VistaPreviaProducto from '@/components/VistaPreviaProducto';
import DemoAsistente from '@/components/DemoAsistente';

// Solo para los titulares de la landing: un trazo más marcado que el sans del
// resto de la app, para que la portada tenga una voz propia sin tocar la
// tipografía que usa la aplicación (Logo, botones, formularios...).
const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'] });

const FUNCIONES = [
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
    emoji: '📁',
    titulo: 'Todo lo de un tema, junto',
    texto:
      'Las carpetas agrupan notas y tareas del mismo asunto. Adjunta PDFs o fotos donde hagan falta, y entra en un tema para verlo todo ordenado, no repartido en pestañas.',
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
        <header className="sticky top-0 z-20 border-b border-ink/5 bg-white/70 backdrop-blur-md">
          <div className="container-page flex items-center justify-between py-4">
            <Logo />
            <nav className="flex items-center gap-2">
              <Link href="#funciones" className="btn-fantasma hidden sm:inline-flex">
                Funciones
              </Link>
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
          </div>
        </header>

        <main>
          <section className="container-page py-16 sm:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-xl">
                <p className="eyebrow">Notas · Tareas · Asistente</p>
                <h1
                  className={`${grotesk.className} mt-4 text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl`}
                >
                  Escribes la reunión.
                  <br />
                  <span className="texto-degradado">Notiq saca las tareas.</span>
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-ink/70">
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
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="chip">Sin tarjeta</span>
                  <span className="chip">50 notas gratis</span>
                  <span className="chip">20 operaciones de IA al mes</span>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <VistaPreviaProducto />
              </div>
            </div>
          </section>

          <section id="funciones" className="container-page pb-20 pt-4 sm:pb-28">
            <div className="max-w-xl">
              <p className="eyebrow">Cómo funciona</p>
              <h2
                className={`${grotesk.className} mt-3 text-3xl font-bold tracking-tight sm:text-4xl`}
              >
                Una sola pantalla, no cuatro apps
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {FUNCIONES.map((funcion) => (
                <article key={funcion.titulo} className="card-flotante card-flotante-interactiva p-6">
                  <span aria-hidden className="icono-funcion">
                    {funcion.emoji}
                  </span>
                  <h3 className="mt-4 text-lg font-bold tracking-tight">{funcion.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">{funcion.texto}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-t border-ink/10 py-20 sm:py-28">
            <div className="container-page grid items-center gap-12 lg:grid-cols-[22rem_minmax(0,1fr)]">
              <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
                <DemoAsistente />
              </div>
              <div className="order-1 max-w-xl lg:order-2">
                <p className="eyebrow">El asistente</p>
                <h2
                  className={`${grotesk.className} mt-3 text-3xl font-bold tracking-tight sm:text-4xl`}
                >
                  Pregúntale, no lo busques
                </h2>
                <p className="mt-4 text-ink/65">
                  No es un chat genérico pegado a un lado: ha leído tus notas y ve tus
                  tareas abiertas antes de contestar. «Resume mis notas de esta semana».
                  «¿Qué tengo pendiente para el viernes?». Solo ve lo tuyo, y solo cuando
                  se lo preguntas.
                </p>
              </div>
            </div>
          </section>

          <section id="precios" className="border-t border-ink/10 py-20 sm:py-28">
            <div className="container-page">
              <div className="max-w-xl">
                <p className="eyebrow">Precios</p>
                <h2
                  className={`${grotesk.className} mt-3 text-3xl font-bold tracking-tight sm:text-4xl`}
                >
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
              <p className="mt-6 text-sm text-ink/45">
                Cambia o cancela cuando quieras desde Ajustes, sin escribir a nadie.
              </p>
            </div>
          </section>
        </main>

        <footer className="border-t border-ink/10 py-12">
          <div className="container-page flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Logo />
              <p className="mt-3 max-w-xs text-sm text-ink/55">
                Notas, tareas y un asistente que las ha leído todas.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink/60">
              <Link href="#funciones" className="hover:text-ink">
                Funciones
              </Link>
              <Link href="#precios" className="hover:text-ink">
                Precios
              </Link>
              <Link href="/entrar" className="hover:text-ink">
                Entrar
              </Link>
            </div>
          </div>
          <div className="container-page mt-8 border-t border-ink/10 pt-6 text-xs text-ink/40">
            © {new Date().getFullYear()} Notiq
          </div>
        </footer>
      </div>
    </div>
  );
}
