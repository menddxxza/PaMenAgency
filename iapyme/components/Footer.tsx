import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink py-12 text-white/70">
      <div className="container-page">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo inverso />
            <p className="mt-2 max-w-sm text-sm">
              El marketplace de soluciones de IA para pymes. En español.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a href="#categorias" className="hover:text-white">
              Categorías
            </a>
            <a href="#productos" className="hover:text-white">
              Soluciones
            </a>
            <a href="#vender" className="hover:text-white">
              Vender
            </a>
            <a href="#lista" className="hover:text-white">
              Lista de espera
            </a>
          </nav>
        </div>
        <p className="mt-8 border-t border-white/10 pt-6 text-xs text-white/45">
          © {new Date().getFullYear()} IAPyme. Proyecto en fase de validación.
        </p>
      </div>
    </footer>
  );
}
