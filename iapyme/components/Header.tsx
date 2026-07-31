import Link from 'next/link';
import Logo from './Logo';
import Buscador from './Buscador';
import { getPerfilActual } from '@/lib/supabase/server';

export default async function Header() {
  const perfil = await getPerfilActual();

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <div className="hidden flex-1 md:block">
          <Buscador compacto />
        </div>

        <nav className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            href="/categorias"
            className="hidden text-sm font-medium text-ink/70 hover:text-ink sm:block"
          >
            Categorías
          </Link>

          {perfil ? (
            <>
              <Link href="/dashboard" className="btn-secondary px-4 py-2">
                Mi panel
              </Link>
              {perfil.role === 'admin' ? (
                <Link
                  href="/admin"
                  className="hidden text-sm font-medium text-ink/70 hover:text-ink sm:block"
                >
                  Admin
                </Link>
              ) : null}
              <form action="/auth/salir" method="post">
                <button type="submit" className="text-sm font-medium text-ink/60 hover:text-ink">
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/entrar" className="text-sm font-medium text-ink/70 hover:text-ink">
                Entrar
              </Link>
              <Link href="/entrar?registro=1" className="btn-primary px-4 py-2">
                Publicar producto
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
