import Link from 'next/link';
import { createClient, getPerfilActual } from '@/lib/supabase/server';
import type { Product } from '@/lib/database.types';
import EstadoFicha from '@/components/EstadoFicha';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Resumen · IAPyme' };

export default async function ResumenPanel() {
  const supabase = createClient();
  const perfil = await getPerfilActual();
  if (!supabase || !perfil) return null;

  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', perfil.id)
    .order('created_at', { ascending: false });

  const productos = (data ?? []) as Product[];

  const { count: leadsSinLeer } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', perfil.id)
    .eq('status', 'new');

  const publicados = productos.filter((p) => p.status === 'published');
  const visitas = productos.reduce((suma, p) => suma + p.view_count, 0);
  const leads = productos.reduce((suma, p) => suma + p.lead_count, 0);
  const conversion = visitas > 0 ? ((leads / visitas) * 100).toFixed(1) : '—';

  const resenas = productos.reduce((suma, p) => suma + p.rating_total, 0);
  const sumaValoraciones = productos.reduce(
    (suma, p) => suma + p.rating_promedio * p.rating_total,
    0,
  );
  const valoracionMedia = resenas > 0 ? (sumaValoraciones / resenas).toFixed(1) : null;

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hola, {perfil.display_name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            {publicados.length === 0
              ? 'Todavía no tienes ninguna ficha publicada.'
              : `${publicados.length} ${publicados.length === 1 ? 'solución publicada' : 'soluciones publicadas'}.`}
          </p>
        </div>
        <Link href="/dashboard/productos/nuevo" className="btn-primary">
          + Publicar producto
        </Link>
      </header>

      <ChecklistInicio
        perfilCompleto={Boolean(perfil.bio)}
        tieneFicha={productos.length > 0}
        tienePublicada={publicados.length > 0}
      />

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Metrica etiqueta="Visitas a tus fichas" valor={visitas.toLocaleString('es-ES')} />
        <Metrica etiqueta="Mensajes recibidos" valor={leads.toLocaleString('es-ES')} />
        <Metrica
          etiqueta="Conversión"
          valor={conversion === '—' ? '—' : `${conversion} %`}
          ayuda="Cuánta gente que ve la ficha escribe"
        />
        <Metrica
          etiqueta="Reseñas"
          valor={resenas.toLocaleString('es-ES')}
          ayuda={valoracionMedia ? `${valoracionMedia} ★ de media` : undefined}
        />
        <Metrica etiqueta="Sin responder" valor={String(leadsSinLeer ?? 0)} destacar={(leadsSinLeer ?? 0) > 0} />
      </dl>

      {productos.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-4xl" aria-hidden>
            📦
          </p>
          <h2 className="mt-4 text-lg font-bold">Publica tu primera solución</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/65">
            Publicar es gratis y IAPyme no se lleva comisión. Los primeros vendedores
            salen destacados en portada.
          </p>
          <Link href="/dashboard/productos/nuevo" className="btn-primary mt-6">
            Empezar
          </Link>
        </div>
      ) : (
        <section className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold tracking-tight">Tus fichas</h2>
            <Link
              href="/dashboard/productos"
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              Ver todas →
            </Link>
          </div>

          <div className="card mt-4 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink/[0.02] text-xs uppercase tracking-wider text-ink/60">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Producto</th>
                  <th className="px-4 py-3 text-left font-bold">Estado</th>
                  <th className="px-4 py-3 text-right font-bold">Visitas</th>
                  <th className="px-4 py-3 text-right font-bold">Mensajes</th>
                  <th className="px-4 py-3 text-right font-bold">Valoración</th>
                </tr>
              </thead>
              <tbody>
                {productos.slice(0, 5).map((producto) => (
                  <tr key={producto.id} className="border-t border-ink/10">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/productos/${producto.id}`}
                        className="font-semibold hover:text-brand-700"
                      >
                        {producto.titulo}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <EstadoFicha status={producto.status} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{producto.view_count}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{producto.lead_count}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {producto.rating_total > 0
                        ? `${producto.rating_promedio.toFixed(1)} ★ (${producto.rating_total})`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Se oculta sola en cuanto se completan los tres pasos: no tiene sentido
 * seguir mostrándole una lista de tareas a quien ya lleva meses vendiendo.
 */
function ChecklistInicio({
  perfilCompleto,
  tieneFicha,
  tienePublicada,
}: {
  perfilCompleto: boolean;
  tieneFicha: boolean;
  tienePublicada: boolean;
}) {
  const pasos = [
    {
      hecho: perfilCompleto,
      texto: 'Completa tu perfil',
      ayuda: 'Una bio breve ayuda a que confíen antes de escribirte.',
      href: '/dashboard/perfil',
    },
    {
      hecho: tieneFicha,
      texto: 'Publica tu primera ficha',
      ayuda: 'Cuéntanos qué resuelve, para quién y cuánto cuesta.',
      href: '/dashboard/productos/nuevo',
    },
    {
      hecho: tienePublicada,
      texto: 'Consigue tu primera aprobación',
      ayuda: 'La revisamos y, si todo encaja, sale al catálogo.',
      href: '/dashboard/productos',
    },
  ];

  if (pasos.every((paso) => paso.hecho)) return null;

  return (
    <section className="card mt-8 p-6">
      <h2 className="font-bold">Primeros pasos</h2>
      <ul className="mt-4 space-y-1">
        {pasos.map((paso) => (
          <li key={paso.texto}>
            <Link
              href={paso.href}
              className="-mx-2 flex items-start gap-3 rounded-lg px-2 py-2 transition
                         hover:bg-ink/[0.03]"
            >
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                            border text-[11px] font-bold ${
                              paso.hecho
                                ? 'border-accent-500 bg-accent-500 text-white'
                                : 'border-ink/25 text-transparent'
                            }`}
              >
                ✓
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-sm font-semibold ${
                    paso.hecho ? 'text-ink/55 line-through' : 'text-ink'
                  }`}
                >
                  {paso.texto}
                </span>
                {!paso.hecho ? (
                  <span className="mt-0.5 block text-xs text-ink/50">{paso.ayuda}</span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Metrica({
  etiqueta,
  valor,
  ayuda,
  destacar,
}: {
  etiqueta: string;
  valor: string;
  ayuda?: string;
  destacar?: boolean;
}) {
  return (
    <div className={`card p-5 ${destacar ? 'border-amber-300 bg-amber-50' : ''}`}>
      <dt className="text-xs font-bold uppercase tracking-wider text-ink/60">{etiqueta}</dt>
      <dd className="mt-1.5 text-2xl font-semibold tracking-tight">{valor}</dd>
      {ayuda ? <p className="mt-1 text-xs text-ink/50">{ayuda}</p> : null}
    </div>
  );
}
