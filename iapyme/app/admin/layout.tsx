import Link from 'next/link';
import { redirect } from 'next/navigation';
import Logo from '@/components/Logo';
import { getPerfilActual } from '@/lib/supabase/server';
import { supabaseConfigurado } from '@/lib/supabase/config';
import AvisoSinSupabase from '@/components/AvisoSinSupabase';

/**
 * Chrome común de las páginas de admin. Antes cada una vivía suelta, sin
 * ninguna forma de volver al panel normal salvo el botón «atrás» del
 * navegador o editar la URL a mano — de ahí el «Salir del panel» de aquí.
 *
 * También centraliza aquí la comprobación de que quien entra es admin: las
 * páginas la repiten (cinturón y tirantes, como el resto del proyecto), pero
 * este layout es el primer filtro real.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigurado()) {
    return (
      <main className="container-page py-20">
        <AvisoSinSupabase que="El panel de administración" />
      </main>
    );
  }

  const perfil = await getPerfilActual();
  if (!perfil) redirect('/entrar?volver=/admin');
  if (perfil.role !== 'admin') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-ink/[0.02]">
      <header className="border-b border-ink/10 bg-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/admin" className="block">
              <Logo />
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/admin"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink/70 transition hover:bg-ink/[0.04] hover:text-ink"
              >
                Moderación
              </Link>
              <Link
                href="/admin/vendedores"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink/70 transition hover:bg-ink/[0.04] hover:text-ink"
              >
                Vendedores
              </Link>
              <Link
                href="/admin/destacadas"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink/70 transition hover:bg-ink/[0.04] hover:text-ink"
              >
                Destacadas
              </Link>
            </nav>
          </div>

          <Link href="/dashboard" className="btn-secondary py-2 text-sm">
            ← Salir del panel
          </Link>
        </div>
      </header>

      <main className="container-page py-10">{children}</main>
    </div>
  );
}
