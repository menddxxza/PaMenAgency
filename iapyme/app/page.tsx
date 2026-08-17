import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Buscador from '@/components/Buscador';
import ProductoCard from '@/components/ProductoCard';
import AvisoSinSupabase from '@/components/AvisoSinSupabase';
import Reveal from '@/components/Reveal';
import Icono, { type NombreIcono } from '@/components/Icono';
import Estrellas from '@/components/Estrellas';
import { getCategorias, getConteoPorCategoria, getDestacados, getProductos } from '@/lib/queries';
import { supabaseConfigurado } from '@/lib/supabase/config';
import { precioResumido, tiempoInstalacion } from '@/lib/formato';
import type { ProductoConRelaciones } from '@/lib/database.types';

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
        {/* ---- Portada: copy a la izquierda, el catálogo real a la derecha.
            Nada de ilustración de IA genérica — lo que se ve es la propia
            interfaz del producto, con datos reales del catálogo. ---- */}
        <section className="border-b border-ink/10">
          <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:gap-16 lg:py-24">
            <div>
              {/* 17ch parte el titular en dos líneas limpias en vez de dejar
                  "usar" huérfano en una tercera. */}
              <h1 className="max-w-[15ch] text-display font-semibold text-ink">
                Soluciones de IA listas para usar
              </h1>

              <p className="mt-5 max-w-[42ch] text-lg leading-relaxed text-ink/60">
                Automatizaciones, agentes y bots hechos por otras pymes españolas.
                Instalación en horas, no en proyectos de meses.
              </p>

              <div className="mt-9 max-w-xl">
                <Buscador />
              </div>

              {/* Franja de cifras decorativa, no una lista de datos real:
                  por eso son <div>/<span> planos y no <dl>. */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink/60">
                <span className="flex items-baseline gap-1.5">
                  <span className="dato font-semibold text-ink">{categorias.length}</span>
                  sectores
                </span>
                <span aria-hidden className="h-3 w-px bg-ink/15" />
                <span className="flex items-baseline gap-1.5">
                  <span className="dato font-semibold text-ink">0%</span>
                  comisión
                </span>
                {totalSoluciones > 0 ? (
                  <>
                    <span aria-hidden className="h-3 w-px bg-ink/15" />
                    <span className="flex items-baseline gap-1.5">
                      <span className="dato font-semibold text-ink">{totalSoluciones}</span>
                      {totalSoluciones === 1 ? 'solución' : 'soluciones'}
                    </span>
                  </>
                ) : null}
              </div>

              <p className="mt-6 text-sm text-ink/65">
                ¿Tienes algo que vender?{' '}
                <Link
                  href="/entrar?registro=1"
                  className="font-medium text-ink underline decoration-ink/25
                             decoration-1 underline-offset-4
                             transition-colors duration-fast ease-out hover:text-brand-700
                             hover:decoration-brand-600"
                >
                  Publícalo gratis
                </Link>
              </p>
            </div>

            {/* Escaparate real: el propio catálogo, no una maqueta. Si
                todavía no hay nada publicado, el hueco lo dice tal cual —
                nunca una cifra o una ficha inventada. */}
            <Reveal delay={80}>
              <EscaparateProducto productos={recientes} />
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

            {/* Índice, no retícula: numeración editorial en dos columnas, con
                una sola regla horizontal por fila en vez de una caja por
                categoría. Nada de líneas verticales ni celdas iguales. */}
            <ul className="mt-12 sm:grid sm:grid-cols-2 sm:gap-x-12">
              {categorias.map((categoria, i) => (
                <li
                  key={categoria.slug}
                  className={
                    i === 0
                      ? '' // primera fila, primera columna: nunca lleva regla arriba
                      : i === 1
                        ? 'border-t border-ink/10 sm:border-t-0' // primera fila en desktop, pero segundo en móvil apilado
                        : 'border-t border-ink/10'
                  }
                >
                  <Reveal delay={Math.min(i, 6) * 40}>
                    <Link
                      href={`/categoria/${categoria.slug}`}
                      className="group flex items-baseline gap-5 py-6
                                 focus:outline-none focus-visible:relative focus-visible:z-10
                                 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:rounded-sm"
                    >
                      <span className="dato shrink-0 text-sm text-ink/45" aria-hidden>
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2.5">
                          <span className="text-lg" aria-hidden>
                            {categoria.icono}
                          </span>
                          <h3 className="font-display text-lg font-semibold tracking-[-0.01em] leading-snug text-ink transition-colors duration-fast ease-out group-hover:text-brand-700">
                            {categoria.nombre}
                          </h3>
                        </span>
                        <p className="mt-1.5 max-w-[38ch] text-sm leading-relaxed text-ink/60">
                          {categoria.descripcion}
                        </p>
                        {conteo[categoria.id] ? (
                          <p className="mt-2 text-xs text-ink/60">
                            {conteo[categoria.id]}{' '}
                            {conteo[categoria.id] === 1 ? 'solución' : 'soluciones'}
                          </p>
                        ) : null}
                      </span>

                      <Icono
                        nombre="flecha"
                        className="h-4 w-4 shrink-0 self-center text-ink/20
                                   transition-transform duration-base ease-out
                                   group-hover:translate-x-1 group-hover:text-brand-600"
                      />
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
                  <h3 className="mt-5 font-display text-lg font-semibold tracking-[-0.01em] text-ink">
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

/**
 * El escaparate del hero es el propio catálogo, no una maqueta ilustrativa:
 * mismos datos que ve cualquiera en /buscar (precio, tiempo de instalación,
 * valoración), solo que aquí van los 3 más recientes. Sin cifras inventadas
 * — si el catálogo está vacío, el hueco lo dice tal cual.
 */
function EscaparateProducto({ productos }: { productos: ProductoConRelaciones[] }) {
  const items = productos.slice(0, 3);

  return (
    <div className="overflow-hidden rounded-xl border border-ink/10 bg-white shadow-quiet lg:shadow-lift">
      <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3.5">
        <p className="dato text-xs font-medium text-ink/60">Catálogo</p>
        {items.length > 0 ? (
          <span className="flex items-center gap-1.5 text-xs text-ink/60">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            recién publicadas
          </span>
        ) : null}
      </div>

      {items.length > 0 ? (
        <ul>
          {items.map((producto, i) => {
            const precio = precioResumido(producto);
            return (
              <li key={producto.id} className={i > 0 ? 'border-t border-ink/10' : ''}>
                <Link
                  href={`/p/${producto.slug}`}
                  className="group flex items-center gap-4 px-5 py-4
                             transition-colors duration-fast ease-out hover:bg-ink/[0.025]
                             focus:outline-none focus-visible:relative focus-visible:z-10
                             focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-lg"
                    aria-hidden
                  >
                    {producto.categories?.icono ?? '·'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-display text-[15px] font-medium text-ink transition-colors duration-fast ease-out group-hover:text-brand-700">
                        {producto.titulo}
                      </span>
                      {producto.rating_total > 0 ? (
                        <Estrellas puntuacion={producto.rating_promedio} tamano="text-[0.65rem]" />
                      ) : null}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2 text-xs text-ink/60">
                      <span className="truncate">{producto.categories?.nombre}</span>
                      <span aria-hidden>·</span>
                      <span className="shrink-0">
                        {tiempoInstalacion(producto.minutos_instalacion)}
                      </span>
                    </span>
                  </span>
                  <span className="dato shrink-0 text-sm font-medium text-ink">
                    {precio.principal}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="px-6 py-10 text-center">
          <p className="font-display text-base font-medium text-ink">
            Todavía no hay nada publicado
          </p>
          <p className="mx-auto mt-1.5 max-w-[30ch] text-sm leading-relaxed text-ink/65">
            Los primeros vendedores salen destacados aquí mismo.
          </p>
          <Link
            href="/entrar?registro=1"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium
                       text-brand-700 transition-colors duration-fast ease-out hover:text-brand-800"
          >
            Publicar el primero
            <Icono nombre="flecha" className="h-4 w-4" />
          </Link>
        </div>
      )}

      {items.length > 0 ? (
        <div className="border-t border-ink/10 px-5 py-3.5">
          <Link
            href="/buscar"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink/60
                       transition-colors duration-fast ease-out hover:text-brand-700"
          >
            Ver el catálogo completo
            <Icono
              nombre="flecha"
              className="h-3.5 w-3.5 transition-transform duration-base ease-out
                         group-hover:translate-x-1"
            />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
