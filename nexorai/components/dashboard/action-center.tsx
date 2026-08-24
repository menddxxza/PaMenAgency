'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Flame, Zap, ArrowRight } from 'lucide-react';
import type { Opportunity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

export function ActionCenter({ opportunities }: { opportunities: Opportunity[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (opportunities.length === 0) {
    return (
      <p className="text-sm text-muted">
        No hay acciones pendientes: o ya has activado todas las oportunidades detectadas, o aún no has
        generado tu AI Business Audit.
      </p>
    );
  }

  async function activate(id: string) {
    setLoadingId(id);
    await fetch(`/api/opportunities/${id}/activate`, { method: 'POST' });
    setLoadingId(null);
    router.refresh();
  }

  return (
    <div>
      <p className="mb-4 flex items-center gap-1.5 text-sm font-medium text-fg">
        <Flame className="h-4 w-4 text-gold-400" />
        {opportunities.length} acciones recomendadas
      </p>
      <ol className="space-y-3">
        {opportunities.map((o, i) => (
          <li key={o.id} className="rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-fg">
                  {i + 1}. {o.name}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Potencial {formatCurrency(o.potential_min)} – {formatCurrency(o.potential_max)}/mes · dificultad{' '}
                  {o.difficulty} · probabilidad {o.probability}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => activate(o.id)} loading={loadingId === o.id}>
                <Zap className="h-3.5 w-3.5" />
                Activar
              </Button>
              <Link href="/opportunities">
                <Button size="sm" variant="ghost">
                  Ver detalles
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
