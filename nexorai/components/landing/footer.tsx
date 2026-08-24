'use client';

import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Logomark, Wordmark } from '@/components/logomark';
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
    <footer className="bg-void landing-hairline relative z-10 border-t">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <Logomark className="h-5" />
              <Wordmark className="text-xs" />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/40">
              Nexorai es un producto de{' '}
              <a
                href="https://pamenagency.com"
                target="_blank"
                rel="noreferrer"
                className="text-white/70 hover:text-white"
              >
                PaMenAgency
              </a>
              . Encontramos dónde está el dinero en tu negocio y ponemos agentes a trabajar para
              conseguirlo.
            </p>
            <p className="mt-3 text-sm text-white/40">
              ¿Dudas?{' '}
              <a href="mailto:soporte.atiende@gmail.com" className="text-white/70 hover:text-white">
                soporte.atiende@gmail.com
              </a>
            </p>
            <div className="mt-5 flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="landing-hairline flex h-8 w-8 items-center justify-center rounded-full border text-white/40 transition-colors hover:border-gold-400/40 hover:text-gold-300"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">Producto</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li>
                <a href="#como-funciona" className="text-white/50 hover:text-white">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#agentes" className="text-white/50 hover:text-white">
                  Agentes
                </a>
              </li>
              <li>
                <a href="#precios" className="text-white/50 hover:text-white">
                  Precios
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">Sectores</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              {SECTORS.slice(0, 4).map((s) => (
                <li key={s.slug}>
                  <Link href={`/sectores/${s.slug}`} className="text-white/50 hover:text-white">
                    {s.namePlural}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">Legal</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noreferrer" className="text-white/50 hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="landing-hairline mt-14 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Nexorai — un producto de PaMenAgency (pamenagency.com). Todos los
            derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
