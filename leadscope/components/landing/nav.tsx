'use client';

import Link from 'next/link';
import { Radar } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/providers/auth-provider';

export function LandingNav() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-fg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Radar className="h-4 w-4" />
          </span>
          LeadScope
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="#features" className="hover:text-fg transition-colors">
            Funciones
          </a>
          <a href="#how" className="hover:text-fg transition-colors">
            Cómo funciona
          </a>
          <a href="#pricing" className="hover:text-fg transition-colors">
            Precios
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link href="/dashboard/search" className={buttonVariants({ size: 'sm' })}>
              Ir al panel
            </Link>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                Entrar
              </Link>
              <Link href="/signup" className={buttonVariants({ size: 'sm' })}>
                Empezar gratis
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
