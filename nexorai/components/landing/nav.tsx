'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logomark, Wordmark } from '@/components/logomark';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#calculadora', label: 'Calculadora' },
  { href: '#agentes', label: 'Agentes' },
  { href: '#precios', label: 'Precios' },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-6xl px-4">
      <div className="flex items-center justify-between rounded-full border border-border bg-surface/80 px-4 py-2.5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 pl-1">
          <Logomark />
          <Wordmark className="text-sm" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-fg"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="px-3 text-sm text-muted transition-colors hover:text-fg">
            Iniciar sesión
          </Link>
          <Link href="/signup">
            <Button size="sm">Analizar mi empresa</Button>
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full p-2 text-fg md:hidden"
          aria-label="Abrir menú"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          'mt-2 grid gap-1 overflow-hidden rounded-2xl border border-border bg-surface/95 p-2 backdrop-blur-md transition-all duration-200 md:hidden',
          open ? 'max-h-96 opacity-100' : 'pointer-events-none max-h-0 border-transparent p-0 opacity-0'
        )}
      >
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-surface-hover hover:text-fg"
          >
            {link.label}
          </a>
        ))}
        <div className="my-1 h-px bg-border" />
        <Link href="/login" className="rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-surface-hover hover:text-fg">
          Iniciar sesión
        </Link>
        <Link href="/signup" className="p-1">
          <Button className="w-full" size="sm">
            Analizar mi empresa
          </Button>
        </Link>
      </div>
    </header>
  );
}
