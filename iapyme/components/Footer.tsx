import Link from 'next/link';
import Logo from './Logo';
import { getCategorias } from '@/lib/queries';

export default async function Footer() {
  const categorias = await getCategorias();

  return (
    <footer className="mt-20 border-t border-white/10 bg-ink py-14 text-white/70">
      <div className="container-page">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo inverso />
            <p className="mt-3 max-w-xs text-sm">
              El marketplace de soluciones de IA para pymes. En español, y sin comisión
              para quien vende.
            </p>
          </div>

          <nav aria-label="Comprar">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">
              Comprar
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/buscar" className="hover:text-white">
                  Todas las soluciones
                </Link>
              </li>
              <li>
                <Link href="/categorias" className="hover:text-white">
                  Categorías
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Vender">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">
              Vender
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/entrar?registro=1" className="hover:text-white">
                  Publicar producto
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white">
                  Panel de vendedor
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Sectores">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">
              Sectores
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {categorias.slice(0, 5).map((categoria) => (
                <li key={categoria.slug}>
                  <Link href={`/categoria/${categoria.slug}`} className="hover:text-white">
                    {categoria.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-12 border-t border-white/10 pt-6 text-xs text-white/45">
          © {new Date().getFullYear()} IAPyme
        </p>
      </div>
    </footer>
  );
}
