import Link from 'next/link';
import { Check } from 'lucide-react';
import { PLANS } from '@/lib/plans';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PricingSection() {
  return (
    <section id="precios" className="mx-auto max-w-6xl px-4 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-brand-400">Precios</p>
        <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Empieza pequeño, escala con resultados
        </h2>
        <p className="mt-3 text-sm text-muted">
          Estructura de referencia — se adapta a cada negocio antes de firmar.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              'flex flex-col p-6',
              plan.highlighted && 'border-brand-500/50 shadow-glow'
            )}
          >
            {plan.highlighted && (
              <span className="mb-3 inline-flex w-fit items-center rounded-full bg-brand-500/10 px-2.5 py-1 text-[11px] font-medium text-brand-400">
                Más elegido
              </span>
            )}
            <h3 className="text-sm font-semibold text-fg">{plan.name}</h3>
            <p className="mt-3 font-display text-2xl font-semibold text-fg">
              {plan.price}
              {plan.priceNote && <span className="ml-1 text-sm font-normal text-muted">{plan.priceNote}</span>}
            </p>
            <p className="mt-2 text-sm text-muted">{plan.description}</p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="mt-6">
              <Button className="w-full" variant={plan.highlighted ? 'primary' : 'secondary'}>
                Empezar
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted">
        Los precios mostrados son de referencia y pueden actualizarse; no representan un compromiso
        contractual hasta la contratación.
      </p>
    </section>
  );
}
