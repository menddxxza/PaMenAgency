import Link from 'next/link';
import { PLANS } from '@/lib/plans';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PricingSection() {
  return (
    <section id="precios" className="bg-void relative mx-auto max-w-6xl scroll-mt-20 px-4 py-28 sm:px-8">
      <div className="max-w-xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold-400">Precios</p>
        <h2 className="mt-4 font-display text-3xl font-semibold uppercase tracking-tight text-white sm:text-4xl">
          Empieza pequeño, escala con resultados
        </h2>
        <p className="mt-3 max-w-md text-sm text-white/45">
          Estructura de referencia — se adapta a cada negocio antes de firmar.
        </p>
      </div>

      <div className="landing-hairline mt-16 grid grid-cols-1 border-t sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'landing-hairline flex flex-col border-b border-r px-6 py-8 last:border-r-0 sm:px-7',
              plan.highlighted && 'bg-white/[0.02]'
            )}
          >
            {plan.highlighted && (
              <span className="h-px w-full bg-gold-400" />
            )}
            <p
              className={cn(
                'mt-6 font-mono text-[10px] uppercase tracking-widest',
                plan.highlighted ? 'text-gold-400' : 'text-white/35'
              )}
            >
              {plan.name}
              {plan.highlighted && <span className="ml-2 text-gold-300">· recomendado</span>}
            </p>

            <p
              className={cn(
                'mt-4 font-display font-semibold text-white',
                plan.highlighted ? 'text-4xl' : 'text-2xl'
              )}
            >
              {plan.price}
              {plan.priceNote && <span className="ml-1 text-sm font-normal text-white/35">{plan.priceNote}</span>}
            </p>
            <p className="mt-3 text-sm text-white/45">{plan.description}</p>

            <ul className="mt-6 flex-1 space-y-2.5 font-mono text-[12px] text-white/55">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/25" />
                  {f}
                </li>
              ))}
            </ul>

            <Link href="/signup" className="mt-7">
              <Button
                variant="secondary"
                className={cn(
                  'w-full',
                  plan.highlighted
                    ? 'border-0 bg-white text-[#0b0b0c] shadow-none hover:bg-white/90'
                    : 'landing-hairline border bg-transparent text-white shadow-none hover:bg-white/5'
                )}
              >
                Empezar
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-white/30">
        Los precios mostrados son de referencia y pueden actualizarse; no representan un compromiso
        contractual hasta la contratación.
      </p>
    </section>
  );
}
