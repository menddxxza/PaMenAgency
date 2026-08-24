'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStageTrigger } from '@/lib/use-stage-trigger';
import type { JourneyState } from '@/components/landing/system-scene';

export function Hero({
  stageIndex,
  journeyRef,
}: {
  stageIndex: number;
  journeyRef: React.MutableRefObject<JourneyState>;
}) {
  const sectionRef = useStageTrigger<HTMLElement>(stageIndex, journeyRef);

  return (
    <section ref={sectionRef} className="relative h-[100dvh] min-h-[640px] w-full overflow-hidden">
      <div aria-hidden="true" className="hero-aurora pointer-events-none absolute inset-0" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/50"
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-16 sm:px-8 sm:pb-24">
        <div className="mx-auto w-full max-w-6xl">
          <p className="animate-fade-in font-mono text-[11px] uppercase tracking-[0.32em] text-gold-400">
            Revenue Intelligence Engine
          </p>

          <h1 className="text-glow animate-slide-up mt-5 max-w-3xl font-display text-5xl font-bold uppercase leading-[0.98] tracking-tight text-white sm:text-7xl lg:text-8xl">
            Tu próxima
            <br />
            fuente de ingresos.
          </h1>

          <p className="animate-slide-up mt-6 max-w-lg text-sm leading-relaxed text-white/50 sm:text-base">
            No vendemos IA. Encontramos dónde está el dinero que tu negocio está dejando sobre la
            mesa, y activamos agentes para ir a por él.
          </p>

          <div className="animate-fade-in mt-10 flex items-center gap-5">
            <Link href="/signup">
              <Button
                variant="secondary"
                size="lg"
                className="border-0 bg-white px-6 text-[#0b0b0c] shadow-none hover:bg-white/90 focus-visible:ring-gold-400/50"
                data-cursor-hover
              >
                Analizar mi empresa
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <a
              href="#como-funciona"
              data-cursor-hover
              className="font-mono text-xs uppercase tracking-widest text-white/45 transition-colors hover:text-white"
            >
              Cómo funciona
            </a>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-4 z-10 hidden text-right font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 sm:right-8 sm:block">
        <p className="flex items-center justify-end gap-2 text-white/45">
          Sistema en vivo
          <span className="tabular-flicker inline-block h-1.5 w-1.5 rounded-full bg-gold-400" />
        </p>
        <p className="mt-1">420 nodos · 22 señales activas</p>
      </div>
    </section>
  );
}
