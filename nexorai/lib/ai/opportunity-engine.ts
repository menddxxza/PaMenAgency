import type { OpportunityEstimate } from '@/lib/ai/audit-engine';

const PROBABILITY_WEIGHT: Record<OpportunityEstimate['probability'], number> = {
  alta: 1,
  media: 0.65,
  baja: 0.35,
};

const DIFFICULTY_PENALTY: Record<OpportunityEstimate['difficulty'], number> = {
  baja: 1,
  media: 0.85,
  alta: 0.7,
};

/**
 * Prioriza oportunidades por impacto esperado ajustado por probabilidad y
 * dificultad (no sólo por potencial bruto): una oportunidad grande pero
 * improbable no debe eclipsar una mediana y casi segura.
 */
export function prioritizeOpportunities(
  opportunities: OpportunityEstimate[]
): (OpportunityEstimate & { priority: number })[] {
  const mid = (o: OpportunityEstimate) => (o.potentialMin + o.potentialMax) / 2;
  const scored = opportunities.map((o) => ({
    ...o,
    priority: Math.round(mid(o) * PROBABILITY_WEIGHT[o.probability] * DIFFICULTY_PENALTY[o.difficulty]),
  }));
  return scored.sort((a, b) => b.priority - a.priority);
}

export function buildActionCenter(
  opportunities: (OpportunityEstimate & { priority: number })[]
): { title: string; description: string; category: OpportunityEstimate['category'] }[] {
  return opportunities.slice(0, 3).map((o) => ({
    title: o.name,
    description: `Potencial de ${Math.round(o.potentialMin).toLocaleString('es-ES')}€ - ${Math.round(o.potentialMax).toLocaleString('es-ES')}€/mes · dificultad ${o.difficulty} · probabilidad ${o.probability}.`,
    category: o.category,
  }));
}
