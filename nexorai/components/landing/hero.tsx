import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroScene } from '@/components/landing/hero-scene';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="bg-void relative h-[100dvh] min-h-[640px] w-full overflow-hidden">
      <HeroScene className="absolute inset-0" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40"
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-16 sm:px-8 sm:pb-24">
        <div className="mx-auto w-full max-w-6xl">
          <p className="animate-fade-in font-mono text-[11px] uppercase tracking-[0.28em] text-gold-400">
            Revenue Intelligence Engine
          </p>

          <h1 className="animate-slide-up mt-4 max-w-2xl font-display text-4xl font-semibold uppercase leading-[1.05] tracking-tight text-white sm:text-6xl">
            Tu próxima
            <br />
            fuente de ingresos.
          </h1>

          <p className="animate-slide-up mt-5 max-w-lg text-sm leading-relaxed text-white/50 sm:text-base">
            No vendemos IA. Encontramos dónde está el dinero que tu negocio está dejando sobre la
            mesa, y activamos agentes para ir a por él.
          </p>

          <div className="animate-fade-in mt-9 flex items-center gap-5">
            <Link href="/signup">
              <Button
                variant="secondary"
                size="md"
                className="border-0 bg-white px-5 text-[#0b0b0c] shadow-none hover:bg-white/90 focus-visible:ring-gold-400/50"
              >
                Analizar mi empresa
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <a
              href="#como-funciona"
              className="font-mono text-xs uppercase tracking-widest text-white/45 transition-colors hover:text-white"
            >
              Cómo funciona
            </a>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-4 z-10 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-white/25 sm:right-8 sm:block">
        <span>Sistema en vivo</span>
        <span className="tabular-flicker ml-2 inline-block h-1.5 w-1.5 rounded-full bg-gold-400 align-middle" />
      </div>
    </section>
  );
}
