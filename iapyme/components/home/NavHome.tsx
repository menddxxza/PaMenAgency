import Link from 'next/link';
import Logo from '@/components/Logo';

/**
 * Cabecera de la portada. Es la versión oscura de `Header`: el resto del sitio
 * es claro, pero esta página va sobre vídeo, así que aquí el cromo es cristal
 * translúcido sobre fondo oscuro.
 *
 * "Salir" es un formulario POST, no un enlace, para que también funcione sin
 * JavaScript y no se dispare por un prefetch.
 */
export default function NavHome({
  sesionIniciada,
  esAdmin,
  totalSectores,
}: {
  sesionIniciada: boolean;
  esAdmin: boolean;
  totalSectores: number;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-[#0a0a0a]/40 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-5 sm:px-8 md:px-12">
        <Link
          href="/"
          className="shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <Logo inverso />
        </Link>

        <nav className="hidden items-center gap-8 md:flex lg:gap-10" aria-label="Principal">
          <Link
            href="/buscar"
            className="text-sm text-white/85 transition-colors duration-300 hover:text-white"
          >
            Catálogo
          </Link>
          <Link
            href="/categorias"
            className="text-sm text-white/85 transition-colors duration-300 hover:text-white"
          >
            Sectores
            <sup className="ml-1 font-mono text-[10px] text-white/60">{totalSectores}</sup>
          </Link>
          <Link
            href="/como-funciona"
            className="text-sm text-white/85 transition-colors duration-300 hover:text-white"
          >
            Cómo funciona
          </Link>
          <Link
            href="/blog"
            className="text-sm text-white/85 transition-colors duration-300 hover:text-white"
          >
            Blog
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {sesionIniciada ? (
            <>
              {esAdmin ? (
                <Link
                  href="/admin"
                  className="hidden rounded-md px-3 py-2 text-xs text-white/85 transition-colors
                             duration-300 hover:text-white sm:inline-flex sm:text-sm"
                >
                  Admin
                </Link>
              ) : null}
              <Link
                href="/dashboard"
                className="rounded-md border border-white/20 bg-white/15 px-4 py-2 text-xs
                           text-white backdrop-blur-md transition-colors duration-300
                           hover:bg-white/25 focus:outline-none focus-visible:ring-2
                           focus-visible:ring-white/70 sm:px-5 sm:text-sm"
              >
                Mi panel
              </Link>
              <form action="/auth/salir" method="post">
                <button
                  type="submit"
                  className="rounded-md px-3 py-2 text-xs text-white/85 transition-colors
                             duration-300 hover:text-white focus:outline-none
                             focus-visible:ring-2 focus-visible:ring-white/70 sm:text-sm"
                >
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/entrar"
                className="rounded-md px-3 py-2 text-xs text-white/85 transition-colors
                           duration-300 hover:text-white sm:text-sm"
              >
                Entrar
              </Link>
              <Link
                href="/entrar?registro=1"
                className="rounded-md border border-white/20 bg-white/15 px-4 py-2 text-xs
                           text-white backdrop-blur-md transition-colors duration-300
                           hover:bg-white/25 focus:outline-none focus-visible:ring-2
                           focus-visible:ring-white/70 sm:px-5 sm:text-sm"
              >
                Publicar gratis
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
