import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icono from '@/components/Icono';
import Distintivo from '@/components/ui/Distintivo';
import { FAMILIAS } from '@/lib/tipos-publicacion';
import { getCategorias, getConteoPorCategoria, getConteoPorTipo } from '@/lib/queries';

export const metadata = {
  title: 'Explorar · IAPyme',
  description:
    'Recorre el marketplace por tipo de publicación o por sector: soluciones de IA, servicios, negocios, profesionales, trabajos y proyectos.',
  alternates: { canonical: '/explorar' },
};

export const revalidate = 300;

export default async function ExplorarPage() {
  const [categorias, conteoCategorias, conteoTipos] = await Promise.all([
    getCategorias(),
    getConteoPorCategoria(),
    getConteoPorTipo(),
  ]);

  const totalPorFamilia = (tipos: string[]) =>
    tipos.reduce((suma, tipo) => suma + (conteoTipos[tipo] ?? 0), 0);

  return (
    <>
      <Header />

      <main className="container-page py-10 sm:py-14">
        <header className="max-w-2xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Explorar
          </h1>
          <p className="mt-3 leading-relaxed text-ink/65">
            Todo el marketplace ordenado de dos maneras: por lo que es cada publicación y por
            el sector al que sirve. Empieza por donde te resulte más natural.
          </p>
        </header>

        {/* ---- Por tipo ---- */}
        <section className="mt-10" aria-labelledby="por-tipo">
          <h2 id="por-tipo" className="font-display text-lg font-semibold text-ink">
            Por tipo de publicación
          </h2>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FAMILIAS.map((familia) => {
              const total = totalPorFamilia(familia.tipos);

              return (
                <li key={familia.slug}>
                  <Link
                    href={`/explorar/${familia.slug}`}
                    className="group flex h-full gap-4 rounded-xl border border-superficie-200
                               bg-superficie-0 p-4 transition-colors duration-fast ease-out
                               hover:border-superficie-300 hover:bg-superficie-50
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <span
                      aria-hidden
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
                                 bg-brand-50 text-brand-700"
                    >
                      <Icono nombre={familia.icono} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-[15px] font-semibold text-ink">
                          {familia.nombre}
                        </span>
                        {total > 0 ? (
                          <span className="dato text-xs text-ink/50">{total}</span>
                        ) : (
                          <Distintivo>Sin publicaciones</Distintivo>
                        )}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-ink/60">
                        {familia.descripcion}
                      </span>
                    </span>

                    <Icono
                      nombre="flecha"
                      className="h-4 w-4 shrink-0 self-center text-ink/25 transition-transform
                                 duration-base ease-out group-hover:translate-x-0.5
                                 group-hover:text-brand-600"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ---- Por sector ---- */}
        <section className="mt-12" aria-labelledby="por-sector">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="por-sector" className="font-display text-lg font-semibold text-ink">
              Por sector
            </h2>
            <Link
              href="/categorias"
              className="text-sm font-medium text-brand-700 transition-colors duration-fast
                         ease-out hover:text-brand-800 focus:outline-none focus-visible:ring-2
                         focus-visible:ring-brand-500 focus-visible:rounded-sm"
            >
              Ver los {categorias.length} sectores
            </Link>
          </div>

          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categorias.map((categoria) => (
              <li key={categoria.slug}>
                <Link
                  href={`/categoria/${categoria.slug}`}
                  className="flex h-full flex-col gap-2 rounded-xl border border-superficie-200
                             bg-superficie-0 p-4 transition-colors duration-fast ease-out
                             hover:border-superficie-300 hover:bg-superficie-50
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <span aria-hidden className="text-xl">
                    {categoria.icono}
                  </span>
                  <span className="text-sm font-medium leading-snug text-ink">
                    {categoria.nombre}
                  </span>
                  {conteoCategorias[categoria.id] ? (
                    <span className="dato mt-auto text-xs text-ink/50">
                      {conteoCategorias[categoria.id]}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </>
  );
}
