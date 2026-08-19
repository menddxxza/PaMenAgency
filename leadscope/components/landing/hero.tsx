'use client';

import Link from 'next/link';
import { ArrowRight, Search, Globe2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-20 sm:pt-28">
      <div className="absolute inset-0 -z-10 bg-grid bg-fade-mask" />
      <div className="absolute left-1/2 top-0 -z-10 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]" />

      <div className="container flex flex-col items-center text-center">
        <Badge variant="brand" className="animate-fade-in">
          <Globe2 className="h-3.5 w-3.5" />
          Datos en tiempo real desde Google Places
        </Badge>

        <h1 className="mt-6 max-w-3xl animate-slide-up text-4xl font-semibold tracking-tight text-fg sm:text-6xl [animation-delay:80ms]">
          Encuentra negocios <span className="text-brand-600">sin página web</span> en cualquier
          ciudad del mundo
        </h1>

        <p className="mt-5 max-w-xl animate-slide-up text-balance text-lg text-muted [animation-delay:160ms]">
          Busca por nicho, ciudad o código postal. Detectamos automáticamente qué negocios no
          tienen web, tienen una web rota o solo usan redes sociales — tu próxima venta ya está
          en el mapa.
        </p>

        <div className="mt-8 flex animate-slide-up flex-col gap-3 sm:flex-row [animation-delay:240ms]">
          <Link href="/signup" className={buttonVariants({ variant: 'brand', size: 'lg' })}>
            Empezar gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#how" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
            <Search className="h-4 w-4" />
            Ver cómo funciona
          </a>
        </div>

        <div className="mt-16 w-full max-w-4xl animate-slide-up [animation-delay:320ms]">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card-hover">
            <div className="flex items-center gap-1.5 border-b border-border bg-surface-hover px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
              <span className="ml-3 text-xs text-muted">leadscope.app/dashboard/search</span>
            </div>
            <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-[220px_1fr] sm:divide-x sm:divide-y-0">
              <div className="space-y-3 p-5 text-left">
                <div className="h-8 rounded-lg bg-surface-hover" />
                <div className="h-8 rounded-lg bg-surface-hover" />
                <div className="h-8 w-2/3 rounded-lg bg-surface-hover" />
                <div className="h-9 rounded-lg bg-brand-600/90" />
              </div>
              <div className="space-y-2.5 p-5">
                {[
                  ['Clínica Dental Rivas', 'Sin web', 'Alta'],
                  ['Gimnasio PowerFit', 'Solo Instagram', 'Alta'],
                  ['Bufete García & Asoc.', 'Web rota', 'Media'],
                  ['Restaurante La Marina', 'Web activa', 'Baja'],
                ].map(([name, status, opp]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2.5 text-left text-sm"
                  >
                    <span className="font-medium text-fg">{name}</span>
                    <span className="text-xs text-muted">{status}</span>
                    <Badge
                      variant={opp === 'Alta' ? 'success' : opp === 'Media' ? 'warning' : 'outline'}
                    >
                      {opp}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
