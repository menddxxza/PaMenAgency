import Link from 'next/link';
import { Radar } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="container flex flex-col items-center justify-between gap-6 sm:flex-row">
        <Link href="/" className="flex items-center gap-2 font-semibold text-fg">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Radar className="h-3.5 w-3.5" />
          </span>
          LeadScope
        </Link>
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} LeadScope. Todos los derechos reservados.
        </p>
        <div className="flex gap-6 text-sm text-muted">
          <a href="#features" className="hover:text-fg">
            Funciones
          </a>
          <a href="#pricing" className="hover:text-fg">
            Precios
          </a>
          <Link href="/login" className="hover:text-fg">
            Entrar
          </Link>
        </div>
      </div>
    </footer>
  );
}
