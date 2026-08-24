'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Clock, TrendingUp, Coins, ChevronDown } from 'lucide-react';
import type { Opportunity } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, cn } from '@/lib/utils';

const DIFFICULTY_VARIANT = { baja: 'success', media: 'warning', alta: 'danger' } as const;
const PROBABILITY_VARIANT = { alta: 'success', media: 'warning', baja: 'danger' } as const;

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const isActivated = opportunity.status === 'activated';

  async function handleActivate() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/opportunities/${opportunity.id}/activate`, { method: 'POST' });
    setLoading(false);
    if (!res.ok) {
      setError('No se pudo activar la oportunidad. Inténtalo de nuevo.');
      return;
    }
    router.refresh();
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-fg">{opportunity.name}</h3>
            {isActivated && <Badge variant="brand">Agente activo</Badge>}
          </div>
          <p className="mt-1 max-w-xl text-sm text-muted">{opportunity.description}</p>
        </div>
        <p className="whitespace-nowrap font-mono text-base font-semibold text-fg">
          {formatCurrency(opportunity.potential_min)}–{formatCurrency(opportunity.potential_max)}
          <span className="text-xs font-normal text-muted">/mes</span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant={DIFFICULTY_VARIANT[opportunity.difficulty]}>Dificultad {opportunity.difficulty}</Badge>
        <Badge variant={PROBABILITY_VARIANT[opportunity.probability]}>Probabilidad {opportunity.probability}</Badge>
        <Badge variant="outline">
          <Clock className="h-3 w-3" /> {opportunity.estimated_days} días
        </Badge>
        <Badge variant="outline">
          <TrendingUp className="h-3 w-3" /> ROI {opportunity.roi_multiple}x
        </Badge>
        <Badge variant="outline">
          <Coins className="h-3 w-3" /> Coste est. {formatCurrency(opportunity.estimated_cost)}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={handleActivate} loading={loading} disabled={isActivated}>
          <Zap className="h-3.5 w-3.5" />
          {isActivated ? 'Activada' : 'Activar'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowDetails((v) => !v)}>
          Ver detalles
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showDetails && 'rotate-180')} />
        </Button>
      </div>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

      {showDetails && (
        <p className="mt-3 rounded-xl border border-border bg-surface-hover/50 p-3 text-xs text-muted">
          {opportunity.assumption || 'Estimación basada en los datos proporcionados por tu negocio.'}
        </p>
      )}
    </Card>
  );
}
