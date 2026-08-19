'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/providers/toast-provider';
import type { PlanConfig } from '@/lib/types';

export function PlanCard({
  plan,
  isCurrent,
  isPro,
}: {
  plan: PlanConfig;
  isCurrent: boolean;
  isPro: boolean;
}) {
  const { push } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval: 'monthly' }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Error al iniciar el pago');
      window.location.href = data.url;
    } catch (err) {
      push(err instanceof Error ? err.message : 'Error al iniciar el pago', 'error');
      setLoading(false);
    }
  }

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Error al abrir el portal');
      window.location.href = data.url;
    } catch (err) {
      push(err instanceof Error ? err.message : 'Error al abrir el portal', 'error');
      setLoading(false);
    }
  }

  return (
    <Card className={isCurrent ? 'border-brand-500/40 p-6 shadow-glow' : 'p-6'}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted">{plan.name}</h3>
        {isCurrent && (
          <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-600 dark:text-brand-400">
            Plan actual
          </span>
        )}
      </div>

      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-semibold text-fg">${plan.priceMonthly}</span>
        <span className="text-sm text-muted">/mes</span>
      </p>

      <ul className="mt-5 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-fg">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            {f}
          </li>
        ))}
      </ul>

      {plan.id === 'pro' && !isPro && (
        <Button variant="brand" className="mt-6 w-full" onClick={handleUpgrade} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mejorar a Pro'}
        </Button>
      )}
      {plan.id === 'pro' && isPro && (
        <Button variant="secondary" className="mt-6 w-full" onClick={handleManage} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gestionar suscripción'}
        </Button>
      )}
    </Card>
  );
}
