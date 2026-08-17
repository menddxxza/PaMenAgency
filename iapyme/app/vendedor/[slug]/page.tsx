import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductoCard from '@/components/ProductoCard';
import { getProductosDeVendedor, getVendedor } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const vendedor = await getVendedor(params.slug);
  if (!vendedor) return { title: 'Vendedor no encontrado · IAPyme' };

  return {
    title: `${vendedor.display_name} · IAPyme`,
    description: vendedor.bio ?? `Soluciones de IA publicadas por ${vendedor.display_name}.`,
    alternates: { canonical: `/vendedor/${vendedor.slug}` },
  };
}

export default async function PerfilVendedor({ params }: { params: { slug: string } }) {
  const vendedor = await getVendedor(params.slug);
  if (!vendedor) notFound();

  const productos = await getProductosDeVendedor(vendedor.id);

  return (
    <>
      <Header />

      <main className="container-page py-12">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {vendedor.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vendedor.avatar_url}
              alt=""
              className="h-16 w-16 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500" />
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {vendedor.display_name}
              </h1>
              {vendedor.is_verified ? (
                <span className="rounded-full bg-accent-500/15 px-2.5 py-1 text-xs font-bold text-accent-700">
                  ✓ Verificado
                </span>
              ) : null}
              {vendedor.is_founder ? (
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                  Vendedor fundador
                </span>
              ) : null}
            </div>

            {vendedor.bio ? <p className="mt-2 max-w-2xl text-ink/70">{vendedor.bio}</p> : null}

            {vendedor.website_url ? (
              <a
                href={vendedor.website_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline"
              >
                {vendedor.website_url.replace(/^https?:\/\//, '')}
              </a>
            ) : null}

            <dl className="mt-5 flex gap-8">
              <div>
                <dt className="text-xs uppercase tracking-wider text-ink/60">Soluciones</dt>
                <dd className="mt-0.5 text-xl font-semibold">{productos.length}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-ink/60">En IAPyme desde</dt>
                <dd className="mt-0.5 text-xl font-semibold">
                  {new Date(vendedor.created_at).getFullYear()}
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <section className="mt-12">
          <h2 className="text-lg font-semibold tracking-tight">Sus soluciones</h2>
          {productos.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {productos.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-ink/60">
              Todavía no tiene ninguna solución publicada.
            </p>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
