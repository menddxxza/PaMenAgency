import HeaderLanding from '@/components/HeaderLanding';
import Footer from '@/components/Footer';
import ProductoCardEstatico from '@/components/ProductoCardEstatico';
import WaitlistForm from '@/components/WaitlistForm';
import { CATEGORIAS } from '@/lib/categorias';
import { PRODUCTOS } from '@/lib/productos';

const PASOS_COMPRADOR = [
  {
    titulo: 'Busca por tu sector',
    texto: 'Diez categorías verticales. Encuentras lo que resuelve tu problema, no un catálogo genérico.',
  },
  {
    titulo: 'Mira la ficha técnica',
    texto: 'Qué hace, qué necesitas tener, capturas, demo en vídeo, tiempo de instalación y precio. Sin sorpresas.',
  },
  {
    titulo: 'Compra y ponlo en marcha',
    texto: 'La mayoría de soluciones están funcionando en menos de una hora. Sin contratar a nadie.',
  },
];

const PASOS_VENDEDOR = [
  {
    titulo: 'Sube tu proyecto',
    texto: 'Automatizaciones, agentes, bots, apps, webs, SaaS, scripts o templates. Si funciona, se puede vender.',
  },
  {
    titulo: 'Publica una ficha seria',
    texto: 'Problema, solución, requisitos, demo y precio. La plataforma en español; tu producto, en el idioma que quieras.',
  },
  {
    titulo: 'Vende 1.000 veces',
    texto: 'El mismo trabajo, vendido muchas veces, sin dar soporte uno a uno ni perseguir clientes por LinkedIn.',
  },
];

const FAQS = [
  {
    pregunta: '¿Qué se puede vender exactamente?',
    respuesta:
      'Producto digital listo para usar: automatizaciones (n8n, Make, Zapier), agentes y bots de IA, apps, webs, SaaS, scripts y templates. Lo que no encaja son tutoriales, cursos ni PDFs: para eso ya existe Hotmart.',
  },
  {
    pregunta: '¿En qué se diferencia de Flippa, Gumroad o Wallapop?',
    respuesta:
      'Flippa y Acquire están en inglés y para operaciones de cinco cifras. Gumroad y Hotmart son para infoproductos. Wallapop es generalista, sin ficha técnica ni garantías. IAPyme es vertical de IA, en español y con fichas técnicas de verdad.',
  },
  {
    pregunta: '¿Cuánto se lleva la plataforma?',
    respuesta:
      'Comisión del 5 % en producto digital, 10 % si incluye instalación y 15 % en servicio a medida. Los vendedores de la primera tanda no pagan comisión durante los primeros 3 meses.',
  },
  {
    pregunta: '¿Y si compro algo y no funciona?',
    respuesta:
      'Cada ficha lleva requisitos y tiempo de instalación por escrito, y solo puede dejar review quien ha comprado. Estamos definiendo la política de devolución con los primeros usuarios: si te apuntas, entras en esa conversación.',
  },
  {
    pregunta: '¿Cuándo abrís?',
    respuesta:
      'Estamos validando la demanda antes de construir. Si la respuesta acompaña, el marketplace abre en semanas, no en meses. Apuntarte a la lista es lo que hace que salga adelante.',
  },
];

export default function Home() {
  const destacados = PRODUCTOS.filter((p) => p.destacado);
  const resto = PRODUCTOS.filter((p) => !p.destacado);

  return (
    <>
      <HeaderLanding />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-ink text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-40 h-[32rem] w-[32rem] rounded-full
                       bg-brand-600/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-52 -left-24 h-[28rem] w-[28rem] rounded-full
                       bg-accent-500/20 blur-3xl"
          />

          <div className="container-page relative grid gap-12 py-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-28">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                En fase de validación · Plazas de vendedor fundador limitadas
              </p>

              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                El marketplace de{' '}
                <span className="bg-gradient-to-r from-brand-300 to-accent-400 bg-clip-text text-transparent">
                  soluciones de IA
                </span>{' '}
                para pymes
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
                Automatizaciones, agentes y bots listos para usar. Una pyme los compra y
                los tiene funcionando en minutos. Un developer los sube una vez y los
                vende mil. Todo en español.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#lista" className="btn-primary">
                  Quiero comprar soluciones
                </a>
                <a
                  href="#vender"
                  className="btn border border-white/25 bg-white/5 text-white hover:bg-white/10"
                >
                  Quiero vender las mías
                </a>
              </div>

              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-white/60">Categorías</dt>
                  <dd className="mt-1 text-2xl font-extrabold">10</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-white/60">Puesta en marcha</dt>
                  <dd className="mt-1 text-2xl font-extrabold">&lt; 1 h</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-white/60">Idioma</dt>
                  <dd className="mt-1 text-2xl font-extrabold">Español</dd>
                </div>
              </dl>
            </div>

            <div className="lg:pl-4">
              <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-2 backdrop-blur">
                <div className="rounded-xl bg-white p-1 text-ink">
                  <WaitlistForm origen="hero" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* El hueco del mercado */}
        <section className="border-b border-ink/10 bg-brand-50/50 py-16">
          <div className="container-page">
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow">Por qué existe IAPyme</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Buscamos dónde vender un agente de IA en español. No existía.
              </h2>
              <p className="mt-4 text-lg text-ink/70">
                Había que buscar clientes uno a uno, por LinkedIn y por WhatsApp. Ese es el
                día a día de miles de developers y freelancers de IA hispanohablantes. Y al
                otro lado, pymes que necesitan exactamente eso y no saben a quién llamar.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { nombre: 'Flippa / Acquire', problema: 'En inglés y para operaciones de 5 cifras.' },
                { nombre: 'Gumroad / Hotmart', problema: 'Infoproductos y cursos, no proyectos técnicos.' },
                { nombre: 'Wallapop / Milanuncios', problema: 'Generalistas, sin ficha técnica ni garantías.' },
              ].map((item) => (
                <div key={item.nombre} className="card p-5">
                  <p className="text-sm font-bold">{item.nombre}</p>
                  <p className="mt-1 text-sm text-ink/65">{item.problema}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categorías */}
        <section id="categorias" className="py-20">
          <div className="container-page">
            <p className="eyebrow">Categorías verticales</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
              Soluciones organizadas por sector, no por tecnología
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-ink/70">
              Una clínica dental no busca &ldquo;un agente conversacional&rdquo;. Busca dejar
              de perder llamadas.
            </p>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {CATEGORIAS.map((categoria) => (
                <li
                  key={categoria.slug}
                  className="card p-5 transition hover:-translate-y-0.5 hover:border-brand-300"
                >
                  <span className="text-2xl" aria-hidden>
                    {categoria.icono}
                  </span>
                  <h3 className="mt-3 text-sm font-bold">{categoria.nombre}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink/60">
                    {categoria.descripcion}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Productos */}
        <section id="productos" className="border-y border-ink/10 bg-ink/[0.02] py-20">
          <div className="container-page">
            <p className="eyebrow">Catálogo de salida</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
              Las 5 primeras soluciones, ya construidas
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-ink/70">
              No son mockups: son productos que ya funcionan. Así se ve una ficha en IAPyme.
            </p>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {destacados.map((producto) => (
                <ProductoCardEstatico key={producto.slug} producto={producto} />
              ))}
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {resto.map((producto) => (
                <ProductoCardEstatico key={producto.slug} producto={producto} />
              ))}
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="py-20">
          <div className="container-page grid gap-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Si compras</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Una solución de IA en 5 minutos, sin contratar a nadie
              </h2>
              <ol className="mt-8 space-y-6">
                {PASOS_COMPRADOR.map((paso, indice) => (
                  <li key={paso.titulo} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                      {indice + 1}
                    </span>
                    <div>
                      <h3 className="font-bold">{paso.titulo}</h3>
                      <p className="mt-1 text-sm text-ink/70">{paso.texto}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div id="vender" className="scroll-mt-20">
              <p className="eyebrow">Si vendes</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Sube tu proyecto una vez y véndelo mil
              </h2>
              <ol className="mt-8 space-y-6">
                {PASOS_VENDEDOR.map((paso, indice) => (
                  <li key={paso.titulo} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-500 text-sm font-bold text-white">
                      {indice + 1}
                    </span>
                    <div>
                      <h3 className="font-bold">{paso.titulo}</h3>
                      <p className="mt-1 text-sm text-ink/70">{paso.texto}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="card mt-8 border-accent-500/30 bg-accent-500/[0.06] p-5">
                <p className="text-sm font-bold">Vendedores fundadores</p>
                <p className="mt-1 text-sm text-ink/70">
                  Los primeros en subir producto no pagan comisión durante 3 meses y salen
                  destacados en portada el día del lanzamiento.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lista de espera */}
        <section id="lista" className="scroll-mt-16 bg-ink py-20 text-white">
          <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow text-brand-300">Acceso anticipado</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Esto se construye si hay gente al otro lado
              </h2>
              <p className="mt-4 text-lg text-white/75">
                Estamos midiendo la demanda antes de escribir el marketplace entero. Déjanos
                tu email y dinos qué lado te interesa: eso decide qué se construye primero y
                en qué orden.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-white/75">
                {[
                  'Aviso el día que abrimos, antes que nadie.',
                  'Los vendedores fundadores entran sin comisión 3 meses.',
                  'Tu respuesta influye en qué categoría se lanza primero.',
                ].map((punto) => (
                  <li key={punto} className="flex gap-3">
                    <span className="text-accent-400" aria-hidden>
                      ✓
                    </span>
                    {punto}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-1 text-ink">
              <WaitlistForm origen="cierre" />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <div className="container-page max-w-3xl">
            <p className="eyebrow">Preguntas</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Lo que nos preguntáis
            </h2>

            <div className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
              {FAQS.map((faq) => (
                <details key={faq.pregunta} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {faq.pregunta}
                    <span
                      className="shrink-0 text-xl text-ink/40 transition group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">{faq.respuesta}</p>
                </details>
              ))}
            </div>

            <p className="mt-10 text-center text-sm text-ink/60">
              ¿Otra pregunta?{' '}
              <a href="#lista" className="font-semibold text-brand-600 hover:underline">
                Escríbenosla en el formulario
              </a>
              .
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
