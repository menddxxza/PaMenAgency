import { Check } from 'lucide-react';
import { requireOrgContext } from '@/lib/server/org-context';
import { PLANS } from '@/lib/plans';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default async function BillingPage() {
  const { organization, isComplimentary } = await requireOrgContext();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-brand-400">Facturación</p>
        <h1 className="mt-1 text-2xl font-semibold text-fg">Tu plan</h1>
        {isComplimentary ? (
          <p className="mt-1 text-sm text-muted">
            Tienes <span className="text-fg">acceso completo sin coste</span> — cuenta interna con todos los
            planes y agentes desbloqueados.
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted">
            Estás en el plan <span className="capitalize text-fg">{organization.plan}</span>. El cobro real
            todavía no está activo en este entorno de demostración — para cambiar de plan, contacta con
            PaMenAgency.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === organization.plan;
          return (
            <Card key={plan.id} className={cn('flex flex-col p-6', isCurrent && 'border-brand-500/50 shadow-glow')}>
              {isCurrent && <Badge variant="brand" className="mb-3 w-fit">Plan actual</Badge>}
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
              <Button className="mt-6" variant={isCurrent ? 'secondary' : 'outline'} disabled={isCurrent}>
                {isCurrent ? 'Plan actual' : 'Contactar para cambiar'}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-fg">Modelo Performance (success fee)</h2>
        <p className="mt-2 text-sm text-muted">
          Con el plan Performance, además de la cuota base, Revynai cobra un {organization.success_fee_pct || 5}%
          sobre el ingreso confirmado y atribuido a la plataforma. Ejemplo: si en un mes se confirman{' '}
          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
            10000
          )}{' '}
          de ingreso atribuible, el success fee sería{' '}
          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
            10000 * ((organization.success_fee_pct || 5) / 100)
          )}
          . Este cálculo no está conectado a pagos reales todavía.
        </p>
      </Card>
    </div>
  );
}
