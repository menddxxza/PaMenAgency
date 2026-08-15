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
  // Cifras reales del catálogo. Nada inventado: si están a cero, no se muestran.
  const totalSoluciones = Object.values(conteo).reduce((suma, n) => suma + n, 0);

  return (
    <>
      <Header />

      <main>
        {/* ---- Portada: titular con medida de lectura cuidada, índice a la
            derecha en vez de un panel de estadísticas. ---- */}
        <section className="border-b border-ink/10">
          <div className="container-page grid gap-16 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-32">
            <div>
              {/* 17ch parte el titular en dos líneas limpias en vez de dejar
                  "usar" huérfano en una tercera. */}
              <h1 className="max-w-[17ch] text-display font-medium text-ink">
                Soluciones de IA listas para usar
              </h1>

              <p className="mt-6 max-w-[38ch] text-lg leading-relaxed text-ink/60">
                Automatizaciones, agentes y bots para tu pyme, funcionando en menos de una
                hora. Sin contratar a nadie.
              </p>

              <div className="mt-10 max-w-xl">
                <Buscador />
              </div>

              <p className="mt-5 text-sm text-ink/60">
                ¿Tienes algo que vender?{' '}
                <Link
                  href="/entrar?registro=1"
                  className="font-medium text-ink underline decoration-ink/25
                             decoration-1 underline-offset-4
                             transition-colors duration-fast ease-out hover:text-brand-700
                             hover:decoration-brand-600"
                >
                  Publícalo gratis
                </Link>{' '}
                — sin comisión
              </p>
            </div>

            {/* Índice: hechos comprobables del catálogo, presentados como
                sumario editorial, no como widget de panel. */}
            <Reveal delay={80}>
              <aside className="lg:border-l lg:border-ink/10 lg:pl-12">
                <div className="flex items-baseline gap-x-8 gap-y-2 text-sm text-ink/65">
                  <span>
                    <span className="dato font-medium text-ink">{categorias.length}</span>{' '}
                    sectores
                  </span>
                  <span>
                    <span className="dato font-medium text-ink">0%</span> comisión
                  </span>
                  {totalSoluciones > 0 ? (
                    <span>
                      <span className="dato font-medium text-ink">{totalSoluciones}</span>{' '}
                      {totalSoluciones === 1 ? 'solución' : 'soluciones'}
                    </span>
                  ) : null}
                </div>

                <div className="regla mt-6" />

                {recientes.length > 0 ? (
                  <>
                    <p className="eyebrow mt-6">Lo último publicado</p>
                    <ul className="mt-1">
                      {recientes.slice(0, 4).map((producto) => (
                        <li key={producto.id} className="border-t border-ink/10 first:border-t-0">
                          <Link
                            href={`/p/${producto.slug}`}
                            className="group flex items-center gap-4 py-4
                                       focus:outline-none focus-visible:ring-2
                                       focus-visible:ring-brand-500 focus-visible:ring-offset-2
                                       focus-visible:rounded-sm"
                          >
                            <span className="min-w-0 flex-1">
                              <span
                                className="block truncate font-display text-[15px] text-ink
                                           transition-colors duration-fast ease-out
                                           group-hover:text-brand-700"
                              >
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
                    <p className="mt-6 font-display text-lg text-ink">
                      El catálogo está abriendo
                    </p>
                    <p className="mt-2 max-w-[32ch] text-sm leading-relaxed text-ink/60">
                      Los primeros vendedores salen destacados en portada. Publicar es
                      gratis y no cobramos comisión.
                    </p>
                    <Link
                      href="/entrar?registro=1"
                      className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium
                                 text-brand-700 transition-colors duration-fast ease-out
                                 hover:text-brand-800"
                    >
                      Publicar el primero
                      <Icono nombre="flecha" className="h-4 w-4" />
                    </Link>
                  </>
                )}
              </aside>
            </Reveal>
          </div>
        </section>

        {/* ---- Sectores ---- */}
        <section className="border-b border-ink/10 py-20 lg:py-28">
          <div className="container-page">
            <Reveal>
              <p className="eyebrow">Categorías</p>
              <h2 className="mt-3 max-w-[22ch] text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                Explora por sector
              </h2>
              <p className="mt-3 max-w-[48ch] text-ink/60">
                Una clínica dental no busca un agente conversacional. Busca dejar de perder
                llamadas.
              </p>
            </Reveal>

            <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-5">
              {categorias.map((categoria, i) => (
                <li key={categoria.slug} className="bg-white">
                  <Reveal delay={Math.min(i, 6) * 40} className="h-full">
                    <Link
                      href={`/categoria/${categoria.slug}`}
                      className="group flex h-full flex-col p-6
                                 transition-colors duration-base ease-out hover:bg-brand-50/40
                                 focus:outline-none focus-visible:relative focus-visible:z-10
                                 focus-visible:ring-2 focus-visible:ring-inset
                                 focus-visible:ring-brand-500"
                    >
                      <span className="text-xl" aria-hidden>
                        {categoria.icono}
                      </span>

                      <h3 className="mt-4 font-display text-[15px] font-normal leading-snug text-ink transition-colors duration-fast ease-out group-hover:text-brand-700">
                        {categoria.nombre}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-ink/65">
                        {categoria.descripcion}
                      </p>

                      {conteo[categoria.id] ? (
                        <p className="mt-auto pt-4 text-xs text-ink/65">
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
          <section className="py-20">
            <div className="container-page max-w-2xl">
              <AvisoSinSupabase que="El catálogo" />
            </div>
          </section>
        ) : !hayCatalogo ? (
          <section className="py-24 lg:py-32">
            <div className="container-page max-w-xl">
              <p className="eyebrow">Catálogo</p>
              <h2 className="mt-3 text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                El catálogo está empezando
              </h2>
              <p className="mt-4 max-w-[48ch] leading-relaxed text-ink/60">
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
              <section className="py-20 lg:py-28">
                <div className="container-page">
                  <Reveal>
                    <div className="flex flex-wrap items-baseline justify-between gap-4">
                      <div>
                        <p className="eyebrow">Selección</p>
                        <h2 className="mt-3 text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                          Destacados
                        </h2>
                      </div>
                      <Link
                        href="/buscar"
                        className="group inline-flex items-center gap-1.5 text-sm font-medium
                                   text-ink/60 transition-colors duration-fast ease-out
                                   hover:text-brand-700"
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

                  <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {destacados.map((producto, i) => (
                      <Reveal key={producto.id} delay={Math.min(i, 4) * 60} className="h-full">
                        <ProductoCard producto={producto} />
                      </Reveal>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {recientes.length > 0 ? (
              <section className="border-t border-ink/10 py-20 lg:py-28">
                <div className="container-page">
                  <Reveal>
                    <p className="eyebrow">Novedades</p>
                    <h2 className="mt-3 text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                      Recién publicadas
                    </h2>
                  </Reveal>

                  <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {recientes.map((producto, i) => (
                      <Reveal key={producto.id} delay={Math.min(i, 4) * 60} className="h-full">
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
        <section className="border-t border-ink/10 py-24 lg:py-32">
          <div className="container-page grid gap-12 md:grid-cols-3 md:gap-10">
            {VENTAJAS.map((bloque, i) => (
              <Reveal key={bloque.titulo} delay={i * 80}>
                <div className="group">
                  <Icono
                    nombre={bloque.icono}
                    className="h-6 w-6 text-brand-600 transition-transform duration-base ease-out group-hover:-translate-y-0.5"
                  />
                  <h3 className="mt-5 font-display text-lg font-normal text-ink">
                    {bloque.titulo}
                  </h3>
                  <p className="mt-2 max-w-[36ch] text-sm leading-relaxed text-ink/60">
                    {bloque.texto}
                  </p>
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
