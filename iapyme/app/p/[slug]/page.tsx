import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FormularioLead from '@/components/FormularioLead';
import ResenasProducto from '@/components/ResenasProducto';
import BotonFavorito from '@/components/BotonFavorito';
import { getMiResena, getProducto, getResenas, registrarVisita } from '@/lib/queries';
import { getPerfilActual } from '@/lib/supabase/server';
import { NOMBRE_TIPO, euros, precioResumido, tiempoInstalacion } from '@/lib/formato';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const producto = await getProducto(params.slug);
  if (!producto) return { title: 'Solución no encontrada · IAPyme' };

  return {
    title: producto.meta_title ?? `${producto.titulo} · IAPyme`,
    description: producto.meta_description ?? producto.tagline,
    alternates: { canonical: `/p/${producto.slug}` },
    openGraph: {
      title: producto.titulo,
      description: producto.tagline,
      images: producto.cover_image_url ? [producto.cover_image_url] : undefined,
    },
  };
}

export default async function FichaProducto({ params }: { params: { slug: string } }) {
  const producto = await getProducto(params.slug);

  // Los borradores y las fichas en revisión no son públicas. RLS ya las oculta a
  // terceros; esto cubre el caso del propio vendedor mirando su ficha sin publicar.
  if (!producto) notFound();

  if (producto.status === 'published') {
    await registrarVisita(producto.id);
  }

  const [resenas, perfil, miResena] = await Promise.all([
    getResenas(producto.id),
    getPerfilActual(),
    getMiResena(producto.id),
  ]);

  const precio = precioResumido(producto);
  const vendedor = producto.profiles;

  return (
    <>
      <Header />

      <main className="container-page py-10">
        {producto.status !== 'published' ? (
          <p className="card mb-8 border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-900">
            Esta ficha todavía no es pública. Estado: <b>{producto.status}</b>.
            {producto.motivo_rechazo ? ` Motivo: ${producto.motivo_rechazo}` : ''}
          </p>
        ) : null}

        <nav aria-label="Migas" className="text-sm text-ink/50">
          <Link href="/" className="hover:text-ink">
            Inicio
          </Link>
          {producto.categories ? (
            <>
              {' › '}
              <Link
                href={`/categoria/${producto.categories.slug}`}
                className="hover:text-ink"
              >
                {producto.categories.nombre}
              </Link>
            </>
          ) : null}
          {' › '}
          <span className="text-ink">{producto.titulo}</span>
        </nav>

        <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_320px] lg:items-start">
          <article>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {producto.titulo}
            </h1>
            <p className="mt-2 text-lg text-ink/70">{producto.tagline}</p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-ink/[0.05] px-3 py-1 text-ink/70">
                {NOMBRE_TIPO[producto.product_type]}
              </span>
              <span className="rounded-full bg-accent-500/10 px-3 py-1 text-accent-700">
                Listo en {tiempoInstalacion(producto.minutos_instalacion)}
              </span>
              {producto.idioma_producto === 'en' ? (
                <span className="rounded-full bg-ink/[0.05] px-3 py-1 text-ink/70">
                  Producto en inglés
                </span>
              ) : null}
              {producto.view_count > 0 ? (
                <span className="rounded-full bg-ink/[0.05] px-3 py-1 text-ink/70">
                  {producto.view_count} visitas
                </span>
              ) : null}
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-gradient-to-br from-brand-50 to-ink/[0.06]">
              {producto.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={producto.cover_image_url}
                  alt={`Captura de ${producto.titulo}`}
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center text-5xl" aria-hidden>
                  {producto.categories?.icono ?? '🤖'}
                </div>
              )}
            </div>

            {producto.gallery_urls.length > 0 ? (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {producto.gallery_urls.slice(0, 4).map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="aspect-video w-full rounded-lg border border-ink/10 object-cover"
                    loading="lazy"
                  />
                ))}
              </div>
            ) : null}

            {producto.demo_video_url ? (
              <a
                href={producto.demo_video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-4"
              >
                ▶ Ver vídeo demo
              </a>
            ) : null}

            <div className="mt-12 space-y-10">
              <section>
                <h2 className="eyebrow">El problema</h2>
                <p className="mt-2 whitespace-pre-line text-ink/80">{producto.problema}</p>
              </section>

              <section>
                <h2 className="eyebrow">La solución</h2>
                <p className="mt-2 whitespace-pre-line text-ink/80">{producto.solucion}</p>
              </section>

              {producto.descripcion ? (
                <section>
                  <h2 className="eyebrow">Qué hace exactamente</h2>
                  <p className="mt-2 whitespace-pre-line text-ink/80">
                    {producto.descripcion}
                  </p>
                </section>
              ) : null}

              {producto.requisitos ? (
                <section>
                  <h2 className="eyebrow">Qué necesitas tener</h2>
                  <p className="mt-2 whitespace-pre-line text-ink/80">
                    {producto.requisitos}
                  </p>
                </section>
              ) : null}

              {producto.tags.length > 0 ? (
                <section>
                  <h2 className="eyebrow">Integra con</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {producto.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-ink/10 px-3 py-1 text-sm text-ink/70"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <ResenasProducto
                productId={producto.id}
                tituloProducto={producto.titulo}
                resenas={resenas}
                ratingPromedio={producto.rating_promedio}
                ratingTotal={producto.rating_total}
                sesionIniciada={Boolean(perfil)}
                yaHaResenado={Boolean(miResena)}
              />
            </div>
          </article>

          <aside className="lg:sticky lg:top-24">
            <div className="card p-6">
              <p className="text-3xl font-extrabold tracking-tight">{precio.principal}</p>
              {precio.secundario ? (
                <p className="mt-1 text-sm text-ink/60">{precio.secundario}</p>
              ) : null}

              {producto.pricing_model === 'setup_plus_monthly' && producto.precio_mensual > 0 ? (
                <p className="mt-3 text-xs text-ink/55">
                  Primer año: {euros(producto.precio_setup + producto.precio_mensual * 12)}
                </p>
              ) : null}

              <div className="mt-5 border-t border-ink/10 pt-5">
                <FormularioLead
                  productId={producto.id}
                  sellerId={producto.seller_id}
                  tituloProducto={producto.titulo}
                />
              </div>

              <div className="mt-3">
                <BotonFavorito productId={producto.id} variante="ficha" />
              </div>

              <ul className="mt-5 space-y-2 border-t border-ink/10 pt-5 text-xs text-ink/60">
                <li>✓ Listo en {tiempoInstalacion(producto.minutos_instalacion)}</li>
                <li>✓ Trato directo con quien lo ha construido</li>
                <li>✓ IAPyme no cobra comisión</li>
              </ul>
            </div>

            {vendedor ? (
              <div className="card mt-4 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-ink/40">
                  Lo vende
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-brand-500 to-accent-500" />
                  <div className="min-w-0">
                    <p className="truncate font-bold">{vendedor.display_name}</p>
                    {vendedor.is_verified ? (
                      <p className="text-xs font-semibold text-accent-700">✓ Verificado</p>
                    ) : null}
                  </div>
                </div>
                {vendedor.slug ? (
                  <Link href={`/vendedor/${vendedor.slug}`} className="btn-secondary mt-4 w-full">
                    Ver sus soluciones
                  </Link>
                ) : null}
              </div>
            ) : null}
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
