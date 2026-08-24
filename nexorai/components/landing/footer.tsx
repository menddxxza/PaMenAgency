'use client';

import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Logomark, Wordmark } from '@/components/logomark';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SECTORS } from '@/lib/sectors';

const LEGAL_LINKS = [
  { label: 'Política de privacidad', href: 'https://pamenagency.com/legal/privacidad' },
  { label: 'Política de cookies', href: 'https://pamenagency.com/legal/cookies' },
  { label: 'Términos y condiciones', href: 'https://pamenagency.com/legal/terminos' },
  { label: 'Tratamiento de datos', href: 'https://pamenagency.com/legal/tratamiento-de-datos' },
];

const SOCIALS = [
  { icon: Linkedin, href: 'https://linkedin.com/company/pamenagency', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://instagram.com/pamenagency', label: 'Instagram' },
  { icon: Twitter, href: 'https://x.com/pamenagency', label: 'X' },
  { icon: Facebook, href: 'https://facebook.com/pamenagency', label: 'Facebook' },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <Logomark />
              <Wordmark className="text-sm" />
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Nexorai es un producto de{' '}
              <a href="https://pamenagency.com" target="_blank" rel="noreferrer" className="text-fg hover:underline">
                PaMenAgency
              </a>
              . Encontramos dónde está el dinero en tu negocio y ponemos agentes a trabajar para
              conseguirlo.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-brand-500/40 hover:text-fg"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Producto</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li>
                <a href="#como-funciona" className="text-muted hover:text-fg">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#agentes" className="text-muted hover:text-fg">
                  Agentes
                </a>
              </li>
              <li>
                <a href="#precios" className="text-muted hover:text-fg">
                  Precios
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Sectores</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              {SECTORS.slice(0, 4).map((s) => (
                <li key={s.slug}>
                  <Link href={`/sectores/${s.slug}`} className="text-muted hover:text-fg">
                    {s.namePlural}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Legal</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noreferrer" className="text-muted hover:text-fg">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Nexorai — un producto de PaMenAgency (pamenagency.com). Todos los
            derechos reservados.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-xs items-center gap-2 sm:w-auto"
          >
            <Input type="email" placeholder="tu@empresa.com" className="h-9" required />
            <Button type="submit" size="sm" variant="secondary">
              Enviar
            </Button>
          </form>
        </div>
      </div>
    </footer>
  );
}
