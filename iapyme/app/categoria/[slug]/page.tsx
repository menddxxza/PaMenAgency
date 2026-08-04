import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FiltrosCatalogo from '@/components/FiltrosCatalogo';
import ResultadosCatalogo from '@/components/ResultadosCatalogo';
import { getCategoria, getCategorias, getProductos } from '@/lib/queries';
import { leerFiltros, type ParamsBusqueda } from '@/lib/filtros';

export const revalidate = 60;

export async function generateStaticParams() {
  const categorias = await getCategorias();
  return categorias.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const categoria = await getCategoria(params.slug);
  if (!categoria) return { title: 'Categoría no encontrada · IAPyme' };

  const titulo = `${categoria.nombre}: soluciones de IA para pymes`;
  return {
    title: `${titulo} · IAPyme`,
    description: `${categoria.descripcion} Automatizaciones y agentes de IA listos para usar, en español.`,
    alternates: { canonical: `/categoria/${categoria.slug}` },
    openGraph: { title: titulo, description: categoria.descripcion },
  };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: ParamsBusqueda;
}) {
  const categoria = await getCategoria(params.slug);
  if (!categoria) notFound();

  const [categorias, productos] = await Promise.all([
    getCategorias(),
    getProductos({ ...leerFiltros(searchParams), categoria: categoria.slug }),
  ]);

  return (
    <>
      <Header />

      <main className="container-page py-10">
        <nav aria-label="Migas" className="text-sm text-ink/50">
          <Link href="/" className="hover:text-ink">
            Inicio
          </Link>{' '}
          › <span className="text-ink">{categoria.nombre}</span>
        </nav>

        <header className="mt-4 flex items-start gap-4">
          <span className="text-4xl" aria-hidden>
            {categoria.icono}
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{categoria.nombre}</h1>
            <p className="mt-1 text-ink/65">{categoria.descripcion}</p>
          </div>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside>
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink/40">
              Categorías
            </h2>
            <ul className="mt-3 space-y-0.5">
              {categorias.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/categoria/${c.slug}`}
                    className={`block rounded-lg px-3 py-1.5 text-sm transition ${
                      c.slug === categoria.slug
                        ? 'bg-brand-50 font-semibold text-brand-700'
                        : 'text-ink/70 hover:bg-ink/[0.04]'
                    }`}
                  >
                    <span aria-hidden className="mr-1.5">
                      {c.icono}
                    </span>
                    {c.nombre}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-ink/10 pt-8">
              <FiltrosCatalogo />
            </div>
          </aside>

          <div>
            <p className="mb-6 text-sm text-ink/60">
              {productos.length}{' '}
              {productos.length === 1 ? 'solución encontrada' : 'soluciones encontradas'}
            </p>
            <ResultadosCatalogo
              productos={productos}
              vacio={{
                titulo: `Todavía no hay soluciones en ${categoria.nombre}`,
                texto:
                  'Esta categoría está esperando a su primer vendedor. Si tienes algo que encaje, sales destacado en portada.',
              }}
            />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
