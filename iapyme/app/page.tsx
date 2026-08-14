import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Buscador from '@/components/Buscador';
import ProductoCard from '@/components/ProductoCard';
import AvisoSinSupabase from '@/components/AvisoSinSupabase';
import Reveal from '@/components/Reveal';
import Icono, { type NombreIcono } from '@/components/Icono';
import { getCategorias, getConteoPorCategoria, getDestacados, getProductos } from '@/lib/queries';
import { supabaseConfigurado } from '@/lib/supabase/config';

export const revalidate = 60;

const VENTAJAS: { icono: NombreIcono; titulo: string; texto: string }[] = [
  {
    icono: 'ficha',
    titulo: 'Ficha técnica, no un anuncio',
    texto:
      'Qué hace, qué necesitas tener, cuánto tarda en estar listo y cuánto cuesta. Escrito antes de que preguntes.',
  },
  {
    icono: 'rayo',
    titulo: 'Funcionando el mismo día',
    texto:
      'La mayoría de soluciones se instalan en menos de una hora. Sin proyecto, sin consultoría, sin reuniones.',
  },
  {
    icono: 'idioma',
    titulo: 'En español, para pymes de aquí',
    texto:
      'Vendedores hispanohablantes, integraciones con el software que ya usas y soporte en tu idioma.',
  },
];

export default async function Home() {
  const [categorias, conteo, destacados, recientes] = await Promise.all([
    getCategorias(),
    getConteoPorCategoria(),
    getDestacados(4),
    getProductos({ orden: 'recientes' }, 8),
  ]);

  const hayCatalogo = destacados.length > 0 || recientes.length > 0;
  // Cifras reales del catálogo. Nada inventado: si están a cero, se nota.
  const totalSoluciones = Object.values(conteo).reduce((suma, n) => suma + n, 0);

  return (
    <>
      <Header />

      <main>
        {/* ---- Portada: instrumento a la izquierda, catálogo vivo a la derecha ---- */}
        <section className="relative overflow-hidden border-b border-ink/10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grid [background-size:64px_64px]
                       [mask-image:radial-gradient(ellipse_70%_60%_at_30%_0%,black,transparent)]"
          />

          <div className="container-page relative grid gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-24">
            <div>
              <p className="dato inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-ink/60">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                Marketplace en español
              </p>

              {/* 17ch parte el titular en dos líneas limpias en vez de dejar
                  "usar" huérfano en una tercera. */}
              <h1 className="mt-6 max-w-[17ch] text-display font-bold text-ink">
                Soluciones de IA listas para usar
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink/65">
                Automatizaciones, agentes y bots para tu pyme, funcionando en menos de una
                hora. Sin contratar a nadie.
              </p>

              <div className="mt-8 max-w-xl">
                <Buscador />
              </div>

              <p className="mt-5 text-sm text-ink/65">
                ¿Tienes algo que vender?{' '}
                <Link
                  href="/entrar?registro=1"
                  className="font-semibold text-ink underline decoration-brand-500
                             decoration-2 underline-offset-4
                             transition-colors duration-fast ease-out hover:text-brand-700"
                >
                  Publícalo gratis
                </Link>{' '}
                · sin comisión
              </p>
            </div>

            {/* Panel de datos: solo hechos comprobables del propio catálogo. */}
            <Reveal delay={80}>
              <div className="card p-6 sm:p-7">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    // Un "0 soluciones" gigante no informa de nada: si el catálogo
                    // está vacío, el bloque de abajo ya lo explica mejor.
                    ...(totalSoluciones > 0
                      ? [{ valor: String(totalSoluciones), etiqueta: 'soluciones' }]
                      : []),
                    { valor: String(categorias.length), etiqueta: 'sectores' },
                    { valor: '0%', etiqueta: 'comisión' },
                  ].map((dato) => (
                    <div key={dato.etiqueta}>
                      <p className="dato text-3xl font-semibold text-ink">{dato.valor}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.1em] text-ink/65">
                        {dato.etiqueta}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="regla my-6" />

                {recientes.length > 0 ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/65">
                      Lo último publicado
                    </p>
                    <ul className="mt-3 space-y-1">
                      {recientes.slice(0, 3).map((producto) => (
                        <li key={producto.id}>
                          <Link
                            href={`/p/${producto.slug}`}
                            className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2
                                       transition-colors duration-fast ease-out hover:bg-ink/[0.04]
                                       focus:outline-none focus-visible:ring-2
                                       focus-visible:ring-brand-500"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-ink">
                                {producto.titulo}
                              </span>
                              <span className="block truncate text-xs text-ink/65">
                                {producto.categories?.nombre}
                              </span>
                            </span>
                            <Icono
                              nombre="flecha"
                              className="h-4 w-4 shrink-0 text-ink/25
                                         transition-transform duration-base ease-out
                                         group-hover:translate-x-1 group-hover:text-brand-600"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-ink">El catálogo está abriendo</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink/60">
                      Los primeros vendedores salen destacados en portada. Publicar es
                      gratis y no cobramos comisión.
                    </p>
                    <Link href="/entrar?registro=1" className="btn-primary mt-5 w-full">
                      Publicar el primero
                    </Link>
                  </>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---- Sectores ---- */}
        <section className="border-b border-ink/10 py-16 lg:py-20">
          <div className="container-page">
            <Reveal>
              <div className="regla" />
              <h2 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
                Explora por sector
              </h2>
              <p className="mt-2 max-w-xl text-ink/60">
                Una clínica dental no busca un agente conversacional. Busca dejar de perder
                llamadas.
              </p>
            </Reveal>

            <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {categorias.map((categoria, i) => (
                <li key={categoria.slug}>
                  <Reveal delay={Math.min(i, 6) * 45}>
                    <Link
                      href={`/categoria/${categoria.slug}`}
                      className="card-interactive group flex h-full flex-col p-5
                                 focus:outline-none focus-visible:ring-2
                                 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    >
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-lg
                                   bg-ink/[0.04] text-lg
                                   transition-[background-color,transform] duration-base ease-out
                                   group-hover:-translate-y-0.5 group-hover:bg-brand-50"
                        aria-hidden
                      >
                        {categoria.icono}
                      </span>

                      <h3 className="mt-4 font-display text-sm font-semibold leading-snug transition-colors duration-fast ease-out group-hover:text-brand-700">
                        {categoria.nombre}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-ink/65">
                        {categoria.descripcion}
                      </p>

                      {conteo[categoria.id] ? (
                        <p className="dato mt-auto pt-4 text-[11px] font-medium text-ink/65">
                          {conteo[categoria.id]}{' '}
                          {conteo[categoria.id] === 1 ? 'solución' : 'soluciones'}
                        </p>
                      ) : null}
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---- Catálogo ---- */}
        {!supabaseConfigurado() ? (
          <section className="py-16">
            <div className="container-page max-w-2xl">
              <AvisoSinSupabase que="El catálogo" />
            </div>
          </section>
        ) : !hayCatalogo ? (
          <section className="py-20 lg:py-28">
            <div className="container-page max-w-xl">
              <div className="regla" />
              <h2 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
                El catálogo está empezando
              </h2>
              <p className="mt-3 leading-relaxed text-ink/65">
                Todavía no hay soluciones publicadas. Si tienes una automatización, un
                agente o un bot que funcione, este es el mejor momento para publicarlo: los
                primeros vendedores salen destacados en portada.
              </p>
              <Link href="/entrar?registro=1" className="btn-primary mt-8">
                Publicar el primero
                <Icono nombre="flecha" className="h-4 w-4" />
              </Link>
            </div>
          </section>
        ) : (
          <>
            {destacados.length > 0 ? (
              <section className="py-16 lg:py-20">
                <div className="container-page">
                  <Reveal>
                    <div className="regla" />
                    <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
                      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Destacados
                      </h2>
                      <Link
                        href="/buscar"
                        className="group inline-flex items-center gap-1.5 text-sm font-semibold
                                   text-brand-600 transition-colors duration-fast ease-out
                                   hover:text-brand-800"
                      >
                        Ver todo
                        <Icono
                          nombre="flecha"
                          className="h-4 w-4 transition-transform duration-base ease-out
                                     group-hover:translate-x-1"
                        />
                      </Link>
                    </div>
                  </Reveal>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {destacados.map((producto, i) => (
                      <Reveal key={producto.id} delay={Math.min(i, 4) * 60}>
                        <ProductoCard producto={producto} />
                      </Reveal>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {recientes.length > 0 ? (
              <section className="border-t border-ink/10 bg-ink/[0.02] py-16 lg:py-20">
                <div className="container-page">
                  <Reveal>
                    <div className="regla" />
                    <h2 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
                      Recién publicadas
                    </h2>
                  </Reveal>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {recientes.map((producto, i) => (
                      <Reveal key={producto.id} delay={Math.min(i, 4) * 60}>
                        <ProductoCard producto={producto} />
                      </Reveal>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}
          </>
        )}

        {/* ---- Por qué aquí ---- */}
        <section className="border-t border-ink/10 py-16 lg:py-24">
          <div className="container-page grid gap-10 md:grid-cols-3 md:gap-8">
            {VENTAJAS.map((bloque, i) => (
              <Reveal key={bloque.titulo} delay={i * 80}>
                <div className="group">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl
                               border border-ink/10 bg-white text-brand-600 shadow-card
                               transition-transform duration-base ease-out
                               group-hover:-translate-y-1"
                  >
                    <Icono nombre={bloque.icono} />
                  </span>
                  <h3 className="mt-5 font-display text-base font-semibold">{bloque.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{bloque.texto}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
