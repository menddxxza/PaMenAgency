import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Buscador from '@/components/Buscador';
import ProductoCard from '@/components/ProductoCard';
import AvisoSinSupabase from '@/components/AvisoSinSupabase';
import { getCategorias, getConteoPorCategoria, getDestacados, getProductos } from '@/lib/queries';
import { supabaseConfigurado } from '@/lib/supabase/config';

export const revalidate = 60;

export default async function Home() {
  const [categorias, conteo, destacados, recientes] = await Promise.all([
    getCategorias(),
    getConteoPorCategoria(),
    getDestacados(4),
    getProductos({ orden: 'recientes' }, 8),
  ]);

  const hayCatalogo = destacados.length > 0 || recientes.length > 0;

  return (
    <>
      <Header />

      <main>
        <section className="relative overflow-hidden bg-ink py-20 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-40 h-[32rem] w-[32rem] rounded-full bg-brand-600/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-52 -left-24 h-[28rem] w-[28rem] rounded-full bg-accent-500/20 blur-3xl"
          />

          <div className="container-page relative text-center">
            <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Soluciones de{' '}
              <span className="bg-gradient-to-r from-brand-300 to-accent-400 bg-clip-text text-transparent">
                IA listas para usar
              </span>{' '}
              para tu pyme
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">
              Automatizaciones, agentes y bots funcionando en menos de una hora. Sin
              contratar a nadie.
            </p>

            <div className="mt-10">
              <Buscador />
            </div>

            <p className="mt-5 text-sm text-white/55">
              ¿Tienes algo que vender?{' '}
              <Link href="/entrar?registro=1" className="font-semibold text-white underline">
                Publícalo gratis
              </Link>{' '}
              · sin comisión
            </p>
          </div>
        </section>

        <section className="border-b border-ink/10 py-16">
          <div className="container-page">
            <h2 className="text-2xl font-extrabold tracking-tight">Explora por sector</h2>
            <p className="mt-2 text-ink/65">
              Una clínica dental no busca un agente conversacional. Busca dejar de perder
              llamadas.
            </p>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {categorias.map((categoria) => (
                <li key={categoria.slug}>
                  <Link
                    href={`/categoria/${categoria.slug}`}
                    className="card block h-full p-5 transition hover:-translate-y-0.5 hover:border-brand-300"
                  >
                    <span className="text-2xl" aria-hidden>
                      {categoria.icono}
                    </span>
                    <h3 className="mt-3 text-sm font-bold">{categoria.nombre}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink/60">
                      {categoria.descripcion}
                    </p>
                    {conteo[categoria.id] ? (
                      <p className="mt-2 text-xs font-semibold text-brand-600">
                        {conteo[categoria.id]}{' '}
                        {conteo[categoria.id] === 1 ? 'solución' : 'soluciones'}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {!supabaseConfigurado() ? (
          <section className="py-16">
            <div className="container-page max-w-2xl">
              <AvisoSinSupabase que="El catálogo" />
            </div>
          </section>
        ) : !hayCatalogo ? (
          <section className="py-20">
            <div className="container-page max-w-2xl text-center">
              <p className="text-4xl" aria-hidden>
                🌱
              </p>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                El catálogo está empezando
              </h2>
              <p className="mt-3 text-ink/65">
                Todavía no hay soluciones publicadas. Si tienes una automatización, un
                agente o un bot que funcione, este es el mejor momento para publicarlo: los
                primeros vendedores salen destacados en portada.
              </p>
              <Link href="/entrar?registro=1" className="btn-primary mt-8">
                Publicar el primero
              </Link>
            </div>
          </section>
        ) : (
          <>
            {destacados.length > 0 ? (
              <section className="py-16">
                <div className="container-page">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-2xl font-extrabold tracking-tight">Destacados</h2>
                    <Link href="/buscar" className="text-sm font-medium text-brand-600 hover:underline">
                      Ver todo →
                    </Link>
                  </div>
                  <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {destacados.map((producto) => (
                      <ProductoCard key={producto.id} producto={producto} />
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {recientes.length > 0 ? (
              <section className="border-t border-ink/10 bg-ink/[0.02] py-16">
                <div className="container-page">
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    Recién publicadas
                  </h2>
                  <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {recientes.map((producto) => (
                      <ProductoCard key={producto.id} producto={producto} />
                    ))}
                  </div>
                </div>
              </section>
            ) : null}
          </>
        )}

        <section className="py-20">
          <div className="container-page grid gap-10 md:grid-cols-3">
            {[
              {
                icono: '🔍',
                titulo: 'Ficha técnica, no un anuncio',
                texto:
                  'Qué hace, qué necesitas tener, cuánto tarda en estar listo y cuánto cuesta. Escrito antes de que preguntes.',
              },
              {
                icono: '⚡',
                titulo: 'Funcionando el mismo día',
                texto:
                  'La mayoría de soluciones se instalan en menos de una hora. Sin proyecto, sin consultoría, sin reuniones.',
              },
              {
                icono: '🇪🇸',
                titulo: 'En español, para pymes de aquí',
                texto:
                  'Vendedores hispanohablantes, integraciones con el software que ya usas y soporte en tu idioma.',
              },
            ].map((bloque) => (
              <div key={bloque.titulo}>
                <span className="text-2xl" aria-hidden>
                  {bloque.icono}
                </span>
                <h3 className="mt-3 font-bold">{bloque.titulo}</h3>
                <p className="mt-2 text-sm text-ink/65">{bloque.texto}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
