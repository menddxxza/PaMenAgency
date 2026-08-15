import Link from 'next/link';
import Logo from './Logo';
import Buscador from './Buscador';
import { getPerfilActual } from '@/lib/supabase/server';

export default async function Header() {
  const perfil = await getPerfilActual();

  return (
    <header
      className="sticky top-0 z-40 border-b border-ink/10
                 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70"
    >
      <div className="container-page flex h-16 items-center gap-4">
        <Link
          href="/"
          className="shrink-0 rounded-lg focus:outline-none focus-visible:ring-2
                     focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <Logo />
        </Link>

        <div className="hidden flex-1 md:block">
          <Buscador compacto />
        </div>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link href="/categorias" className="btn-ghost hidden sm:inline-flex">
            Categorías
          </Link>

          {perfil ? (
            <>
              {perfil.role === 'admin' ? (
                <Link href="/admin" className="btn-ghost hidden sm:inline-flex">
                  Admin
                </Link>
              ) : null}
              <Link href="/dashboard" className="btn-secondary px-4 py-2">
                Mi panel
              </Link>
              <form action="/auth/salir" method="post">
                <button type="submit" className="btn-ghost">
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/entrar" className="btn-ghost">
                Entrar
              </Link>
              <Link href="/entrar?registro=1" className="btn-primary px-4 py-2">
                Publicar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
