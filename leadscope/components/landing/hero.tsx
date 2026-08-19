'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight, Phone, Star } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button-variants';

const RadarScene = dynamic(() => import('@/components/three/radar-scene').then((m) => m.RadarScene), {
  ssr: false,
});

const DETECTIONS = [
  { name: 'Clínica Dental Rivas', status: 'Sin web', opportunity: 'Alta' },
  { name: 'Gimnasio PowerFit', status: 'Solo Instagram', opportunity: 'Alta' },
  { name: 'Bufete García & Asoc.', status: 'Web rota', opportunity: 'Media' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10 bg-grid opacity-40" />

      <div className="container grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:py-28">
        <div>
          <p className="animate-slide-up font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400 [animation-delay:0ms]">
            Detección de negocios en tiempo real
          </p>

          <h1 className="mt-5 animate-slide-up text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-5xl lg:text-6xl [animation-delay:70ms]">
            Localiza al negocio que{' '}
            <span className="relative whitespace-nowrap">
              todavía no tiene web
              <svg
                viewBox="0 0 300 12"
                className="absolute -bottom-1 left-0 h-3 w-full text-brand-500"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 9C60 3 240 3 298 9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-md animate-slide-up text-lg leading-relaxed text-muted [animation-delay:140ms]">
            Nicho y ubicación. Nosotros consultamos Google Places, comprobamos cada web en vivo y
            te devolvemos solo los negocios que de verdad necesitan tus servicios.
          </p>

          <div className="mt-8 flex animate-slide-up flex-col gap-3 sm:flex-row [animation-delay:210ms]">
            <Link href="/signup" className={buttonVariants({ variant: 'brand', size: 'lg' })}>
              Empezar gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              Ver cómo funciona
            </a>
          </div>

          <p className="mt-5 animate-slide-up text-xs text-muted [animation-delay:260ms]">
            5 búsquedas gratis al mes · sin tarjeta de crédito
          </p>
        </div>

        <div className="relative animate-fade-in [animation-delay:200ms]">
          <div className="relative aspect-square w-full max-w-md justify-self-center overflow-hidden rounded-2xl border border-border bg-[#0e0b08]">
            <RadarScene />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0e0b08] via-transparent to-transparent" />
          </div>

          <div className="mt-5 space-y-2.5">
            {DETECTIONS.map((d, i) => (
              <div
                key={d.name}
                className="flex animate-slide-up items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm shadow-card"
                style={{ animationDelay: `${320 + i * 90}ms` }}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-fg">{d.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted">
                    {d.status === 'Sin web' ? (
                      <Phone className="h-3 w-3" />
                    ) : (
                      <Star className="h-3 w-3" />
                    )}
                    {d.status}
                  </p>
                </div>
                <span
                  className={
                    d.opportunity === 'Alta'
                      ? 'shrink-0 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success'
                      : 'shrink-0 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning'
                  }
                >
                  {d.opportunity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
