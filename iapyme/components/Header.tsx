import Logo from './Logo';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-ink/70 md:flex">
          <a href="#categorias" className="hover:text-ink">
            Categorías
          </a>
          <a href="#productos" className="hover:text-ink">
            Soluciones
          </a>
          <a href="#vender" className="hover:text-ink">
            Vender
          </a>
          <a href="#faq" className="hover:text-ink">
            Preguntas
          </a>
        </nav>
        <a href="#lista" className="btn-primary px-4 py-2">
          Acceso anticipado
        </a>
      </div>
    </header>
  );
}
