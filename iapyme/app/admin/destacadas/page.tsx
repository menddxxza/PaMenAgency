import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/database.types';
import BotonDestacar from '@/components/BotonDestacar';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Destacadas · IAPyme' };

type ProductoConVendedor = Product & { profiles: { display_name: string } | null };

/**
 * Dónde se activan las solicitudes de "★ Destacar esta ficha" que un
 * vendedor manda desde /dashboard/productos. No hay pasarela de pago en esta
 * fase: el aviso llega por email, el cobro se arregla por fuera, y esto es
 * el único sitio donde se marca como pagado activando el interruptor.
 */
export default async function DestacadasAdminPage() {
  const supabase = createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from('products')
    .select('*, profiles ( display_name )')
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('updated_at', { ascending: false });

  const productos = (data ?? []) as unknown as ProductoConVendedor[];
  const destacadas = productos.filter((p) => p.is_featured).length;

  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Destacadas</h1>
        <p className="mt-1 text-sm text-ink/60">
          {destacadas} {destacadas === 1 ? 'ficha destacada' : 'fichas destacadas'} de{' '}
          {productos.length} publicadas.
        </p>
      </header>

      <section className="card mt-6 p-5">
        <h2 className="text-sm font-bold">Cómo funciona</h2>
        <p className="mt-2 text-sm text-ink/70">
          Un vendedor pide destacar su ficha desde su panel y te llega un email. Acuerda el
          pago por fuera de la plataforma (Bizum, transferencia) y, una vez cobrado, actívalo
          aquí. Las destacadas salen primero en portada.
        </p>
      </section>

      {productos.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-sm text-ink/60">Todavía no hay fichas publicadas.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {productos.map((producto) => (
            <li
              key={producto.id}
              className="card flex flex-wrap items-center justify-between gap-4 p-5"
            >
              <div className="min-w-0">
                <Link
                  href={`/p/${producto.slug}`}
                  target="_blank"
                  className="font-bold hover:text-brand-700 hover:underline"
                >
                  {producto.titulo}
                </Link>
                <p className="mt-1 text-xs text-ink/50">
                  {producto.profiles?.display_name ?? 'vendedor desconocido'}
                </p>
              </div>

              <BotonDestacar id={producto.id} destacadaInicial={producto.is_featured} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
