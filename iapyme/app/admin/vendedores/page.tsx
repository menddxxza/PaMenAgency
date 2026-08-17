import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient, getPerfilActual } from '@/lib/supabase/server';
import type { Profile } from '@/lib/database.types';
import BotonVerificar from '@/components/BotonVerificar';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Vendedores · IAPyme' };

type StatsVendedor = { publicados: number; visitas: number; leads: number; resenas: number };

export default async function VendedoresAdminPage() {
  const supabase = createClient();
  const perfil = await getPerfilActual();
  if (!supabase || !perfil) return null;
  if (perfil.role !== 'admin') redirect('/dashboard');

  const [{ data: vendedores }, { data: productos }] = await Promise.all([
    // in() en vez de eq('role', 'seller'): un admin que también venda no
    // debe quedar fuera solo por su rol — necesita poder verificarse a sí
    // mismo igual que a cualquier otro vendedor.
    supabase
      .from('profiles')
      .select('*')
      .in('role', ['seller', 'admin'])
      .order('created_at', { ascending: false }),
    supabase.from('products').select('seller_id, status, view_count, lead_count, rating_total'),
  ]);

  const porVendedor = new Map<string, StatsVendedor>();
  for (const p of productos ?? []) {
    const fila = porVendedor.get(p.seller_id) ?? { publicados: 0, visitas: 0, leads: 0, resenas: 0 };
    if (p.status === 'published') fila.publicados += 1;
    fila.visitas += p.view_count;
    fila.leads += p.lead_count;
    fila.resenas += p.rating_total;
    porVendedor.set(p.seller_id, fila);
  }

  const lista = (vendedores ?? []) as Profile[];

  return (
    <div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Vendedores</h1>
        <p className="mt-1 text-sm text-ink/60">
          {lista.length} {lista.length === 1 ? 'vendedor registrado' : 'vendedores registrados'}
        </p>
      </header>

      <section className="card mt-6 p-5">
        <h2 className="text-sm font-bold">Cuándo marcar a alguien como verificado</h2>
        <ul className="mt-2 space-y-1 text-sm text-ink/70">
          <li>· Ha publicado al menos una ficha real, ya aprobada.</li>
          <li>· Responde a los mensajes que le llegan en un plazo razonable.</li>
          <li>· No tiene reseñas ni rechazos que hagan dudar de su seriedad.</li>
        </ul>
        <p className="mt-2 text-xs text-ink/50">
          El sello aparece en su perfil público y en cada ficha suya. Solo debería llevarlo
          quien de verdad se lo ha ganado — es lo que le da sentido.
        </p>
      </section>

      {lista.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-sm text-ink/60">Todavía no hay vendedores registrados.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {lista.map((vendedor) => {
            const stats = porVendedor.get(vendedor.id) ?? {
              publicados: 0,
              visitas: 0,
              leads: 0,
              resenas: 0,
            };

            return (
              <li
                key={vendedor.id}
                className="card flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {vendedor.slug ? (
                      <Link
                        href={`/vendedor/${vendedor.slug}`}
                        target="_blank"
                        className="font-bold hover:text-brand-700 hover:underline"
                      >
                        {vendedor.display_name}
                      </Link>
                    ) : (
                      <p className="font-bold">{vendedor.display_name}</p>
                    )}
                    {vendedor.is_founder ? (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                        Fundador
                      </span>
                    ) : null}
                    {vendedor.id === perfil.id ? (
                      <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-xs font-semibold text-ink/60">
                        Tú
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-ink/50">
                    {stats.publicados} {stats.publicados === 1 ? 'publicada' : 'publicadas'} ·{' '}
                    {stats.visitas} visitas · {stats.leads} mensajes
                    {stats.resenas > 0
                      ? ` · ${stats.resenas} ${stats.resenas === 1 ? 'reseña' : 'reseñas'}`
                      : ''}{' '}
                    · desde{' '}
                    {new Date(vendedor.created_at).toLocaleDateString('es-ES', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <BotonVerificar id={vendedor.id} verificadoInicial={vendedor.is_verified} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
