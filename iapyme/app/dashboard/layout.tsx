import Link from 'next/link';
import { redirect } from 'next/navigation';
import Logo from '@/components/Logo';
import NavPanel from '@/components/NavPanel';
import CentroNotificaciones from '@/components/CentroNotificaciones';
import { getPerfilActual } from '@/lib/supabase/server';
import { getNotificaciones } from '@/lib/queries';
import { supabaseConfigurado } from '@/lib/supabase/config';
import AvisoSinSupabase from '@/components/AvisoSinSupabase';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!supabaseConfigurado()) {
    return (
      <main className="container-page py-20">
        <AvisoSinSupabase que="El panel de vendedor" />
      </main>
    );
  }

  const perfil = await getPerfilActual();
  if (!perfil) redirect('/entrar?volver=/dashboard');

  const { items: notificaciones, total: mensajesSinLeer } = await getNotificaciones(perfil.id);

  return (
    <div className="min-h-screen bg-ink/[0.02]">
      <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-ink/10 bg-white px-4 py-5 lg:min-h-screen lg:w-60 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-2 px-2">
            <Link href="/" className="block min-w-0">
              <Logo />
            </Link>
            <CentroNotificaciones items={notificaciones} total={mensajesSinLeer} />
          </div>

          <NavPanel esAdmin={perfil.role === 'admin'} mensajesSinLeer={mensajesSinLeer} />

          <div className="mt-8 border-t border-ink/10 px-2 pt-5">
            <p className="truncate text-sm font-semibold">{perfil.display_name}</p>
            <p className="truncate text-xs text-ink/50">{perfil.email}</p>
            {perfil.slug ? (
              <Link
                href={`/vendedor/${perfil.slug}`}
                className="mt-2 block text-xs font-medium text-brand-600 hover:underline"
              >
                Ver mi perfil público →
              </Link>
            ) : null}
            <form action="/auth/salir" method="post" className="mt-3">
              <button type="submit" className="text-xs font-medium text-ink/50 hover:text-ink">
                Cerrar sesión
              </button>
            </form>
          </div>
        </aside>

        <main className="flex-1 px-5 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
