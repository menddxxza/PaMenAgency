'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button-variants';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);

const ROWS = [
  { key: 'manual', label: 'A mano', task: 'Buscar cliente por cliente, negocio a negocio', done: 1, total: 6 },
  { key: 'leadscope', label: 'Con LeadScope', task: 'Analizar los negocios de tu zona', done: 5, total: 6 },
] as const;

function useSweepingClock(active: boolean) {
  const [label, setLabel] = useState('09:00');

  useEffect(() => {
    if (!active) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setLabel('14:30');
      return;
    }

    let minutes = 9 * 60;
    const id = setInterval(() => {
      minutes = minutes >= 18 * 60 ? 9 * 60 : minutes + 7;
      const h = Math.floor(minutes / 60)
        .toString()
        .padStart(2, '0');
      const m = (minutes % 60).toString().padStart(2, '0');
      setLabel(`${h}:${m}`);
    }, 160);

    return () => clearInterval(id);
  }, [active]);

  return label;
}

export function ComparisonClock() {
  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  const time = useSweepingClock(inView);

  return (
    <section className="border-b border-border py-24">
      <div className="container grid grid-cols-1 items-center gap-14 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-6 bg-brand-500" aria-hidden="true" />
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
              Una jornada, dos formas de prospectar
            </p>
          </div>

          <h2 className="mt-5 text-balance font-display text-3xl font-semibold leading-[1.1] tracking-tight text-fg sm:text-4xl">
            Hasta <span className="text-brand-500">x5 más leads</span> en la misma jornada.
          </h2>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            El mismo rato de prospección, dos resultados muy distintos. A mano, buscar negocio por
            negocio da tiempo a revisar un puñado de clientes potenciales. Con LeadScope, analizas
            cientos de un tirón — y te queda la tarde libre para vender, no para buscar.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className={buttonVariants({ variant: 'brand', size: 'lg' })}>
              Probar gratis ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              Ver cómo funciona
            </a>
          </div>
        </div>

        <div ref={ref} className="relative">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-[#0e0b08] p-8">
            <div className="mx-auto flex w-fit flex-col items-center">
              <svg viewBox="0 0 200 200" className="h-48 w-48" aria-hidden="true">
                <circle cx="100" cy="100" r="88" fill="none" stroke="#2a231b" strokeWidth="10" />
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill="none"
                  stroke="#d18f22"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="552"
                  strokeDashoffset={inView ? '190' : '552'}
                  transform="rotate(-90 100 100)"
                  className="transition-[stroke-dashoffset] duration-1000 ease-out"
                />
                {TICKS.map((deg) => (
                  <line
                    key={deg}
                    x1="100"
                    y1="16"
                    x2="100"
                    y2="26"
                    stroke="#4a4033"
                    strokeWidth="2.5"
                    transform={`rotate(${deg} 100 100)`}
                  />
                ))}
                <g
                  className="origin-center motion-reduce:animate-none"
                  style={{
                    transformOrigin: '100px 100px',
                    animation: inView ? 'leadscope-sweep 9s linear infinite' : 'none',
                  }}
                >
                  <line x1="100" y1="100" x2="100" y2="38" stroke="#f3dda3" strokeWidth="3" strokeLinecap="round" />
                </g>
                <circle cx="100" cy="100" r="5" fill="#f3dda3" />
              </svg>

              <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-[#f3dda3]">
                {time}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8a7c63]">Jornada</p>
            </div>

            <div className="mt-8 space-y-3">
              {ROWS.map((row) => {
                const pct = (row.done / row.total) * 100;
                const isLeadScope = row.key === 'leadscope';
                return (
                  <div
                    key={row.key}
                    className={cn(
                      'rounded-xl border p-4',
                      isLeadScope ? 'border-brand-500/40 bg-brand-500/10' : 'border-[#2a231b] bg-white/[0.03]'
                    )}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn('font-medium', isLeadScope ? 'text-brand-300' : 'text-[#e7dfd0]')}>
                        {row.label}
                      </span>
                      <span className="text-xs text-[#8a7c63]">Quedan {row.total - row.done}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-[#c9bda3]">
                      <span className="truncate pr-3">{row.task}</span>
                      <span className="shrink-0 font-medium text-[#e7dfd0]">
                        {row.done}/{row.total}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className={cn(
                          'h-full rounded-full transition-[width] duration-1000 ease-out',
                          isLeadScope ? 'bg-brand-500' : 'bg-[#8a7c63]'
                        )}
                        style={{ width: inView ? `${pct}%` : '0%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted">
            Simulación ilustrativa. El resultado real depende de tu nicho y tu zona de búsqueda.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes leadscope-sweep {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}
