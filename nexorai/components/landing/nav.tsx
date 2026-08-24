'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logomark, Wordmark } from '@/components/logomark';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#calculadora', label: 'Calculadora' },
  { href: '#agentes', label: 'Agentes' },
  { href: '#precios', label: 'Precios' },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled ? 'bg-[#050505]/85 backdrop-blur-sm landing-hairline border-b' : 'border-b border-transparent'
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Logomark className="h-5" />
          <Wordmark className="text-xs" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-[11px] uppercase tracking-widest text-white/45 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/login"
            className="font-mono text-[11px] uppercase tracking-widest text-white/45 transition-colors hover:text-white"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/signup"
            className="group flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white transition-colors hover:text-gold-400"
          >
            Analizar mi empresa
            <span className="h-1 w-1 rounded-full bg-gold-400 transition-transform group-hover:scale-150" />
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="p-1 text-white md:hidden"
          aria-label="Abrir menú"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          'landing-hairline grid gap-1 overflow-hidden border-t px-4 transition-all duration-200 md:hidden',
          open ? 'max-h-96 bg-[#050505] py-3 opacity-100' : 'pointer-events-none max-h-0 border-transparent py-0 opacity-0'
        )}
      >
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="rounded px-1 py-2.5 font-mono text-xs uppercase tracking-widest text-white/50 hover:text-white"
          >
            {link.label}
          </a>
        ))}
        <div className="landing-hairline my-1 h-px border-t" />
        <Link
          href="/login"
          onClick={() => setOpen(false)}
          className="rounded px-1 py-2.5 font-mono text-xs uppercase tracking-widest text-white/50 hover:text-white"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/signup"
          onClick={() => setOpen(false)}
          className="rounded px-1 py-3 font-mono text-xs uppercase tracking-widest text-gold-400"
        >
          Analizar mi empresa
        </Link>
      </div>
    </header>
  );
}
