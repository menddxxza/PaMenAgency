import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeToggle } from '@/components/ThemeToggle';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Despiece · Plataforma técnica de vehículos',
  description:
    'Despiece 3D interactivo de vehículos: qué es cada componente, dónde está y qué hay que quitar para llegar hasta él.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* El tema se aplica antes del primer pintado para no parpadear. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('despiece-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
      </head>
      <body className={`${sans.variable} ${mono.variable} min-h-screen`}>
        <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-4">
            <Link href="/" className="font-mono text-[13px] font-medium tracking-[0.18em] text-text">
              DESPIECE
            </Link>
            <nav className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.1em] text-text-2">
              <Link href="/" className="transition-colors hover:text-text">
                Buscar
              </Link>
              <Link href="/admin" className="transition-colors hover:text-text">
                Admin
              </Link>
            </nav>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] px-4 py-8">{children}</main>
        <footer className="mt-16 border-t border-line">
          <div className="mx-auto max-w-[1400px] px-4 py-6 font-mono text-[11px] leading-relaxed text-text-3">
            <p>
              Plataforma en construcción. El catálogo cargado es <strong className="text-text-2">DEMO DATA</strong>:
              tiempos, dificultades y fichas técnicas no están verificados contra documentación oficial.
            </p>
            <p className="mt-1">
              Sin referencias OEM ni precios: requieren una fuente con licencia. No se inventan.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
