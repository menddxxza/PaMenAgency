import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient, getPerfilActual } from '@/lib/supabase/server';
import type { ProductoConRelaciones } from '@/lib/database.types';
import AccionesModeracion from '@/components/AccionesModeracion';
import EstadoFicha from '@/components/EstadoFicha';
import { NOMBRE_TIPO, precioResumido, tiempoInstalacion } from '@/lib/formato';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Moderación · IAPyme' };

export default async function ModeracionPage() {
  const supabase = createClient();
  const perfil = await getPerfilActual();
  if (!supabase || !perfil) return null;
  if (perfil.role !== 'admin') redirect('/dashboard');

  const { data } = await supabase
    .from('products')
    .select('*, categories ( slug, nombre, icono ), profiles ( slug, display_name, avatar_url, is_verified )')
    .eq('status', 'pending_review')
    .order('updated_at', { ascending: true });

  const cola = (data ?? []) as unknown as ProductoConRelaciones[];

  const { count: publicados } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published');

  return (
    <div>
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Moderación</h1>
        <p className="mt-1 text-sm text-ink/60">
          {cola.length === 0
            ? 'No hay nada esperando revisión.'
            : `${cola.length} ${cola.length === 1 ? 'ficha espera' : 'fichas esperan'} revisión`}
          {' · '}
          {publicados ?? 0} publicadas en el catálogo
        </p>
      </header>

      <section className="card mt-6 p-5">
        <h2 className="text-sm font-bold">Qué comprobar antes de aprobar</h2>
        <ul className="mt-2 space-y-1 text-sm text-ink/70">
          <li>· ¿Es un producto que funciona, y no un curso, un PDF o una promesa?</li>
          <li>· ¿Están claros los requisitos que necesita tener el comprador?</li>
          <li>· ¿El tiempo de instalación es creíble para lo que promete?</li>
          <li>· ¿Hay demo, captura o vídeo que respalde lo que dice?</li>
          <li>· ¿El precio se entiende sin tener que preguntar?</li>
        </ul>
      </section>

      {cola.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-4xl" aria-hidden>
            ✅
          </p>
          <h2 className="mt-4 text-lg font-bold">Cola vacía</h2>
          <p className="mt-2 text-sm text-ink/65">
            Todo revisado. Aquí aparecerán las fichas nuevas y las que se editen tras
            publicarse.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {cola.map((producto) => {
            const precio = precioResumido(producto);

            return (
              <li key={producto.id} className="card overflow-hidden">
                <div className="grid gap-6 p-6 lg:grid-cols-[1fr_240px]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold">{producto.titulo}</h2>
                      <EstadoFicha status={producto.status} />
                      {producto.published_at ? (
                        <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700">
                          Ya estuvo publicada · es una edición
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 text-ink/70">{producto.tagline}</p>

                    <p className="mt-2 text-xs text-ink/50">
                      {producto.categories?.icono} {producto.categories?.nombre} ·{' '}
                      {NOMBRE_TIPO[producto.product_type]} · {precio.principal}{' '}
                      {precio.secundario} · listo en{' '}
                      {tiempoInstalacion(producto.minutos_instalacion)} ·{' '}
                      {producto.profiles?.display_name ?? 'vendedor desconocido'}
                    </p>

                    <dl className="mt-5 space-y-4 text-sm">
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wider text-ink/40">
                          Problema
                        </dt>
                        <dd className="mt-1 whitespace-pre-line text-ink/80">
                          {producto.problema}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wider text-ink/40">
                          Solución
                        </dt>
                        <dd className="mt-1 whitespace-pre-line text-ink/80">
                          {producto.solucion}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wider text-ink/40">
                          Requisitos
                        </dt>
                        <dd
                          className={`mt-1 whitespace-pre-line ${
                            producto.requisitos ? 'text-ink/80' : 'font-semibold text-red-600'
                          }`}
                        >
                          {producto.requisitos ?? 'Sin requisitos declarados'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wider text-ink/40">
                          Material de apoyo
                        </dt>
                        <dd className="mt-1">
                          {producto.cover_image_url || producto.demo_video_url ? (
                            <span className="text-accent-600">
                              {producto.cover_image_url ? '✓ Portada ' : ''}
                              {producto.demo_video_url ? '✓ Vídeo demo' : ''}
                            </span>
                          ) : (
                            <span className="font-semibold text-red-600">
                              Sin imagen ni vídeo
                            </span>
                          )}
                        </dd>
                      </div>
                    </dl>

                    <Link
                      href={`/p/${producto.slug}`}
                      className="mt-5 inline-block text-sm font-semibold text-brand-600 hover:underline"
                    >
                      Ver la ficha completa →
                    </Link>
                  </div>

                  <AccionesModeracion id={producto.id} destacada={producto.is_featured} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
