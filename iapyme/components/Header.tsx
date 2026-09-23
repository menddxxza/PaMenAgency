import Link from 'next/link';
import Logo from './Logo';
import Buscador from './Buscador';
import Icono from './Icono';
import Avatar from './ui/Avatar';
import { FAMILIAS } from '@/lib/tipos-publicacion';
import { getPerfilActual } from '@/lib/supabase/server';

/**
 * Cabecera del marketplace, en dos alturas:
 *
 *   1. Identidad, buscador y acciones de cuenta.
 *   2. Las familias de publicación, como la barra de categorías de cualquier
 *      marketplace. Se oculta en móvil, donde ese papel lo hace la barra
 *      inferior y la página de explorar.
 *
 * El buscador vive aquí y no solo en la portada a propósito: en un
 * marketplace, buscar es la acción principal en cualquier página, no algo a
 * lo que se vuelve pasando por el inicio.
 */
export default async function Header() {
  const perfil = await getPerfilActual();

  return (
    <header className="sticky top-0 z-40 border-b border-superficie-200 bg-superficie-0/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-3 sm:gap-5">
        <Link
          href="/"
          className="shrink-0 rounded-lg focus:outline-none focus-visible:ring-2
                     focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <Logo />
        </Link>

        <div className="hidden min-w-0 flex-1 md:block">
          <Buscador compacto />
        </div>

        {/* En móvil el buscador no cabe al lado del logo: se entra a la
            búsqueda completa, que ya trae filtros. */}
        <Link
          href="/buscar"
          aria-label="Buscar"
          className="ml-auto rounded-lg p-2 text-ink/70 transition-colors duration-fast ease-out
                     hover:bg-superficie-100 hover:text-ink focus:outline-none
                     focus-visible:ring-2 focus-visible:ring-brand-500 md:hidden"
        >
          <Icono nombre="buscar" />
        </Link>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2 md:ml-0" aria-label="Cuenta">
          {perfil ? (
            <>
              <Link
                href="/dashboard/leads"
                aria-label="Mensajes"
                className="hidden rounded-lg p-2 text-ink/70 transition-colors duration-fast
                           ease-out hover:bg-superficie-100 hover:text-ink focus:outline-none
                           focus-visible:ring-2 focus-visible:ring-brand-500 sm:inline-flex"
              >
                <Icono nombre="mensajes" />
              </Link>

              <Link href="/dashboard/productos/nuevo" className="btn-primary hidden px-4 py-2 sm:inline-flex">
                <Icono nombre="publicar" className="h-4 w-4" />
                Publicar
              </Link>

              <Link
                href="/dashboard"
                className="rounded-full focus:outline-none focus-visible:ring-2
                           focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                aria-label="Mi panel"
              >
                <Avatar nombre={perfil.display_name} url={perfil.avatar_url} tamano="md" />
              </Link>
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

      {/* Barra de familias */}
      <nav
        aria-label="Tipos de publicación"
        className="hidden border-t border-superficie-200 md:block"
      >
        <ul className="container-page flex items-center gap-1 overflow-x-auto py-1.5">
          <li>
            <Link
              href="/explorar"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5
                         text-sm font-medium text-ink transition-colors duration-fast ease-out
                         hover:bg-superficie-100 focus:outline-none focus-visible:ring-2
                         focus-visible:ring-brand-500"
            >
              <Icono nombre="explorar" className="h-4 w-4" />
              Explorar
            </Link>
          </li>

          {FAMILIAS.map((familia) => (
            <li key={familia.slug}>
              <Link
                href={`/explorar/${familia.slug}`}
                className="inline-flex whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-ink/70
                           transition-colors duration-fast ease-out hover:bg-superficie-100
                           hover:text-ink focus:outline-none focus-visible:ring-2
                           focus-visible:ring-brand-500"
              >
                {familia.nombre}
              </Link>
            </li>
          ))}

          <li className="ml-auto">
            <Link
              href="/como-funciona"
              className="inline-flex whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-ink/55
                         transition-colors duration-fast ease-out hover:bg-superficie-100
                         hover:text-ink focus:outline-none focus-visible:ring-2
                         focus-visible:ring-brand-500"
            >
              Cómo funciona
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
