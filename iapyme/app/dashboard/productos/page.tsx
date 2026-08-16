import Link from 'next/link';
import { createClient, getPerfilActual } from '@/lib/supabase/server';
import type { Product } from '@/lib/database.types';
import EstadoFicha from '@/components/EstadoFicha';
import AccionesFicha from '@/components/AccionesFicha';
import { precioResumido } from '@/lib/formato';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Mis productos · IAPyme' };

export default async function MisProductos() {
  const supabase = createClient();
  const perfil = await getPerfilActual();
  if (!supabase || !perfil) return null;

  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', perfil.id)
    .order('created_at', { ascending: false });

  const productos = (data ?? []) as Product[];

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Mis productos</h1>
          <p className="mt-1 text-sm text-ink/60">
            {productos.length} {productos.length === 1 ? 'ficha' : 'fichas'}
          </p>
        </div>
        <Link href="/dashboard/productos/nuevo" className="btn-primary">
          + Publicar producto
        </Link>
      </header>

      {productos.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-sm text-ink/60">Todavía no has creado ninguna ficha.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {productos.map((producto) => {
            const precio = precioResumido(producto);

            return (
              <li key={producto.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold">{producto.titulo}</h2>
                      <EstadoFicha status={producto.status} />
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-ink/60">{producto.tagline}</p>

                    {producto.status === 'rejected' && producto.motivo_rechazo ? (
                      <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        <b>Motivo del rechazo:</b> {producto.motivo_rechazo}
                      </p>
                    ) : null}

                    {producto.status === 'pending_review' ? (
                      <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                        En cola de revisión. Te avisamos en cuanto la miremos.
                      </p>
                    ) : null}

                    <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                      <div className="flex gap-1.5">
                        <dt className="text-ink/45">Precio:</dt>
                        <dd className="font-semibold">
                          {precio.principal}
                          {precio.secundario ? (
                            <span className="font-normal text-ink/55"> {precio.secundario}</span>
                          ) : null}
                        </dd>
                      </div>
                      <div className="flex gap-1.5">
                        <dt className="text-ink/45">Visitas:</dt>
                        <dd className="font-semibold tabular-nums">{producto.view_count}</dd>
                      </div>
                      <div className="flex gap-1.5">
                        <dt className="text-ink/45">Mensajes:</dt>
                        <dd className="font-semibold tabular-nums">{producto.lead_count}</dd>
                      </div>
                      <div className="flex gap-1.5">
                        <dt className="text-ink/45">Conversión:</dt>
                        <dd className="font-semibold tabular-nums">
                          {producto.view_count > 0
                            ? `${((producto.lead_count / producto.view_count) * 100).toFixed(1)} %`
                            : '—'}
                        </dd>
                      </div>
                      <div className="flex gap-1.5">
                        <dt className="text-ink/45">Valoración:</dt>
                        <dd className="font-semibold tabular-nums">
                          {producto.rating_total > 0
                            ? `${producto.rating_promedio.toFixed(1)} ★ (${producto.rating_total})`
                            : '—'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <AccionesFicha
                    id={producto.id}
                    slug={producto.slug}
                    status={producto.status}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
