import Link from 'next/link';
import { Check } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button-variants';
import { Card } from '@/components/ui/card';
import { PLANS } from '@/lib/types';

export function PricingSection() {
  return (
    <section id="pricing" className="container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Precios simples, sin sorpresas
        </h2>
        <p className="mt-4 text-muted">Empieza gratis. Mejora a Pro cuando necesites más volumen.</p>
      </div>

      <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
        {Object.values(PLANS).map((plan) => (
          <Card
            key={plan.id}
            className={
              plan.id === 'pro'
                ? 'relative overflow-hidden border-brand-500/40 p-7 shadow-glow'
                : 'p-7'
            }
          >
            {plan.id === 'pro' && (
              <span className="absolute right-6 top-6 rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-600 dark:text-brand-400">
                Recomendado
              </span>
            )}
            <h3 className="text-sm font-medium text-muted">{plan.name}</h3>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold text-fg">${plan.priceMonthly}</span>
              <span className="text-sm text-muted">/mes</span>
            </p>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-fg">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className={buttonVariants({
                variant: plan.id === 'pro' ? 'brand' : 'secondary',
                className: 'mt-7 w-full',
              })}
            >
              {plan.id === 'pro' ? 'Empezar con Pro' : 'Empezar gratis'}
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
