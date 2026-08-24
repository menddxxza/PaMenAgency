'use client';

import Link from 'next/link';
import { Logomark } from '@/components/logomark';

const LEGAL_LINKS = [
  { href: '/legal/privacidad', label: 'Privacidad' },
  { href: '/legal/cookies', label: 'Cookies' },
  { href: '/legal/terminos', label: 'Términos' },
  { href: '/legal/tratamiento-datos', label: 'Tratamiento de datos' },
];

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-semibold text-fg">
            <Logomark />
            LeadScope
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-fg">
            Volver al inicio
          </Link>
        </div>
      </header>

      <main
        className="container select-none py-16"
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
      >
        <div className="mx-auto max-w-2xl">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
            Legal
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-muted">Última actualización: {updated}</p>

          <div className="mt-10 space-y-8">{children}</div>
        </div>
      </main>

      <footer className="border-t border-border py-10">
        <div className="container flex flex-col items-center gap-4 text-sm text-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} LeadScope</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-fg">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
