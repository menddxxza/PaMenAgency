import Link from 'next/link';
import Logo from './Logo';
import Icono from './Icono';
import { getCategorias } from '@/lib/queries';

const LEGAL = [
  { href: '/legal/privacidad', texto: 'Política de privacidad' },
  { href: '/legal/cookies', texto: 'Política de cookies' },
  { href: '/legal/terminos', texto: 'Términos y condiciones' },
];

export default async function Footer() {
  const categorias = await getCategorias();

  return (
    <footer className="bg-ink text-white/60">
      <div className="container-page">
        {/* Declaración de cierre: lo último que se lee es la propuesta, no un mapa del sitio. */}
        <div className="grid gap-8 border-b border-white/10 py-20 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:py-24">
          <h2 className="max-w-[18ch] text-display-s font-semibold text-white">
            Súbelo una vez. Véndelo mil.
          </h2>

          <div className="lg:pb-2">
            <p className="max-w-sm leading-relaxed">
              Publicar es gratis y no cobramos comisión. Lo que cobras por tu trabajo es
              tuyo, entero.
            </p>
            <Link href="/entrar?registro=1" className="btn-primary mt-6">
              Publicar mi solución
              <Icono nombre="flecha" className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Navegación compacta */}
        <div className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo inverso />
            <p className="mt-4 max-w-xs leading-relaxed">
              El marketplace de soluciones de IA para pymes. En español, y sin comisión
              para quien vende.
            </p>
          </div>

          <nav aria-label="Comprar">
            <h3 className="text-[13px] text-white/60">Comprar</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { href: '/buscar', texto: 'Todas las soluciones' },
                { href: '/categorias', texto: 'Categorías' },
                { href: '/como-funciona', texto: 'Cómo funciona' },
                { href: '/blog', texto: 'Blog' },
              ].map((enlace) => (
                <li key={enlace.href}>
                  <EnlacePie href={enlace.href}>{enlace.texto}</EnlacePie>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Vender">
            <h3 className="text-[13px] text-white/60">Vender</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { href: '/entrar?registro=1', texto: 'Publicar producto' },
                { href: '/dashboard', texto: 'Panel de vendedor' },
              ].map((enlace) => (
                <li key={enlace.href}>
                  <EnlacePie href={enlace.href}>{enlace.texto}</EnlacePie>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Sectores">
            <h3 className="text-[13px] text-white/60">Sectores</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {categorias.slice(0, 5).map((categoria) => (
                <li key={categoria.slug}>
                  <EnlacePie href={`/categoria/${categoria.slug}`}>
                    {categoria.nombre}
                  </EnlacePie>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-7 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="text-white/45">© {new Date().getFullYear()} IAPyme</p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL.map((enlace) => (
                <li key={enlace.href}>
                  <Link
                    href={enlace.href}
                    className="whitespace-nowrap text-white/45 transition-colors duration-fast
                               ease-out hover:text-white focus:outline-none
                               focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    {enlace.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

/** Enlace de pie con el deslizamiento de acento al pasar por encima. */
function EnlacePie({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 whitespace-nowrap
                 transition-colors duration-fast ease-out hover:text-white
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
    >
      <span
        aria-hidden
        className="h-px w-0 bg-brand-400 transition-all duration-base ease-out
                   group-hover:w-3"
      />
      {children}
    </Link>
  );
}
