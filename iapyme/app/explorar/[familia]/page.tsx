import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icono from '@/components/Icono';
import ProductoCard from '@/components/ProductoCard';
import EstadoVacio from '@/components/ui/EstadoVacio';
import { FAMILIAS, familiaPorSlug } from '@/lib/tipos-publicacion';
import { getProductos } from '@/lib/queries';

export const revalidate = 120;

export function generateStaticParams() {
  return FAMILIAS.map((familia) => ({ familia: familia.slug }));
}

export function generateMetadata({ params }: { params: { familia: string } }) {
  const familia = familiaPorSlug(params.familia);
  if (!familia) return {};

  return {
    title: `${familia.nombre} · IAPyme`,
    description: familia.descripcion,
    alternates: { canonical: `/explorar/${familia.slug}` },
  };
}

export default async function FamiliaPage({ params }: { params: { familia: string } }) {
  const familia = familiaPorSlug(params.familia);
  if (!familia) notFound();

  const publicaciones = await getProductos({ tipos: familia.tipos, orden: 'recientes' }, 36);

  return (
    <>
      <Header />

      <main className="container-page py-10 sm:py-14">
        <nav aria-label="Ruta" className="text-sm text-ink/55">
          <Link
            href="/explorar"
            className="transition-colors duration-fast ease-out hover:text-ink focus:outline-none
                       focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Explorar
          </Link>
          <span aria-hidden> / </span>
          <span className="text-ink">{familia.nombre}</span>
        </nav>

        <header className="mt-4 flex items-start gap-4">
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"
          >
            <Icono nombre={familia.icono} className="h-6 w-6" />
          </span>

          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {familia.nombre}
            </h1>
            <p className="mt-1.5 max-w-[56ch] leading-relaxed text-ink/65">
              {familia.descripcion}
            </p>
          </div>
        </header>

        {publicaciones.length > 0 ? (
          <>
            <p className="mt-8 text-sm text-ink/55" aria-live="polite">
              {publicaciones.length}{' '}
              {publicaciones.length === 1 ? 'publicación' : 'publicaciones'}
            </p>

            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {publicaciones.map((publicacion) => (
                <li key={publicacion.id}>
                  <ProductoCard producto={publicacion} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EstadoVacio
            className="mt-8"
            icono={<Icono nombre={familia.icono} className="h-8 w-8" />}
            titulo={`Todavía no hay nada en ${familia.nombre.toLowerCase()}`}
            texto={
              familia.requiereMigracion
                ? 'Esta parte del marketplace está recién abierta. En cuanto alguien publique aquí, aparecerá en esta página.'
                : 'Nadie ha publicado aún en esta sección. Si tienes algo que encaje, eres el primero.'
            }
            accion={{ href: '/publicar', texto: 'Publicar aquí' }}
          />
        )}
      </main>

      <Footer />
    </>
  );
}
