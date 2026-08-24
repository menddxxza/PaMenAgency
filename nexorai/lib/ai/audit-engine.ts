import type { BusinessInput, GoalInput, OpportunityCategory } from '@/lib/types';
import { getSector } from '@/lib/sectors';

/**
 * Motor de auditoría: 100% determinista, sin llamadas a IA. Convierte los
 * datos que el negocio ha aportado en una estimación de potencial de
 * ingresos por categoría, con rangos (nunca una cifra única "garantizada").
 *
 * Cuando falta un dato, se usa un valor por defecto conservador en vez de
 * inventar uno: cada estimación es trazable a una fórmula explícita.
 */

export interface OpportunityEstimate {
  category: OpportunityCategory;
  name: string;
  description: string;
  potentialMin: number;
  potentialMax: number;
  difficulty: 'baja' | 'media' | 'alta';
  estimatedDays: number;
  probability: 'baja' | 'media' | 'alta';
  estimatedCost: number;
  roiMultiple: number;
  assumption: string;
}

export interface AuditResult {
  totalPotentialMin: number;
  totalPotentialMax: number;
  opportunities: OpportunityEstimate[];
}

const DEFAULTS = {
  avgTicket: 350,
  currentCustomers: 40,
  monthlyRevenue: 8000,
  monthlyLeads: 60,
  conversionRate: 0.18,
};

const BENCHMARK_CONVERSION = 0.25;

/** El objetivo declarado por el usuario da más peso a la categoría más relacionada. */
const GOAL_BOOST: Record<GoalInput['goalType'], Partial<Record<OpportunityCategory, number>>> = {
  new_customers: { prospecting: 1.15, conversion_optimization: 1.1 },
  revenue: { automation: 1.1, conversion_optimization: 1.1 },
  leads: { prospecting: 1.2, unfollowed_leads: 1.1 },
  reactivation: { reactivation: 1.3 },
};

function withRange(mid: number, spread = 0.28): [number, number] {
  const min = Math.max(0, Math.round(mid * (1 - spread)));
  const max = Math.round(mid * (1 + spread));
  return [min, max];
}

function roi(potentialMid: number, cost: number): number {
  if (cost <= 0) return potentialMid > 0 ? 9.9 : 0;
  return Math.round((potentialMid / cost) * 10) / 10;
}

export function runAuditEngine(business: BusinessInput, goal: GoalInput): AuditResult {
  const sector = getSector(business.sector);
  const multiplier = sector?.opportunityMultiplier ?? 1;

  const avgTicket = business.avgTicket > 0 ? business.avgTicket : DEFAULTS.avgTicket;
  const currentCustomers =
    business.currentCustomers > 0 ? business.currentCustomers : DEFAULTS.currentCustomers;
  const monthlyRevenue =
    business.monthlyRevenue > 0 ? business.monthlyRevenue : DEFAULTS.monthlyRevenue;
  const monthlyLeads = business.monthlyLeads > 0 ? business.monthlyLeads : DEFAULTS.monthlyLeads;
  const conversionRate =
    business.conversionRate > 0 ? business.conversionRate : DEFAULTS.conversionRate;
  const channelCount = Math.max(business.acquisitionChannels.length, 1);
  const boost = (category: OpportunityCategory) => GOAL_BOOST[goal.goalType]?.[category] ?? 1;

  const opportunities: OpportunityEstimate[] = [];

  // 1. Leads sin seguimiento: ~35% de los leads mensuales no reciben
  // seguimiento estructurado; de esos, una tasa de recuperación conservadora
  // del 15% convierte.
  {
    const unfollowedRate = 0.35;
    const recoverableConversion = 0.15;
    const mid =
      monthlyLeads * unfollowedRate * recoverableConversion * avgTicket * multiplier * boost('unfollowed_leads');
    const [min, max] = withRange(mid);
    const cost = Math.round(mid * 0.12);
    opportunities.push({
      category: 'unfollowed_leads',
      name: 'Recuperar leads sin seguimiento',
      description:
        'Contactos que entraron por tus canales habituales y nunca recibieron una respuesta o un segundo contacto.',
      potentialMin: min,
      potentialMax: max,
      difficulty: 'media',
      estimatedDays: 7,
      probability: 'alta',
      estimatedCost: cost,
      roiMultiple: roi(mid, cost),
      assumption: `Estimado sobre ${Math.round(monthlyLeads)} leads/mes: ~35% sin seguimiento, 15% recuperable a ${avgTicket.toLocaleString('es-ES')}€ de ticket medio.`,
    });
  }

  // 2. Clientes antiguos recuperables: ~20% de la cartera está inactiva;
  // reactivación conservadora del 12%.
  {
    const dormantRate = 0.2;
    const reactivationRate = 0.12;
    const mid =
      currentCustomers * dormantRate * reactivationRate * avgTicket * multiplier * boost('reactivation');
    const [min, max] = withRange(mid, 0.32);
    const cost = Math.round(mid * 0.1);
    opportunities.push({
      category: 'reactivation',
      name: 'Reactivar clientes antiguos',
      description: 'Clientes que ya confiaron en el negocio y llevan tiempo sin volver a comprar.',
      potentialMin: min,
      potentialMax: max,
      difficulty: 'media',
      estimatedDays: 10,
      probability: 'alta',
      estimatedCost: cost,
      roiMultiple: roi(mid, cost),
      assumption: `Estimado sobre ${Math.round(currentCustomers)} clientes: ~20% inactivos, 12% reactivable a ${avgTicket.toLocaleString('es-ES')}€ de ticket medio.`,
    });
  }

  // 3. Prospección: cuanto más concentrados están los canales de captación,
  // mayor el margen de mejora al diversificar/escalar prospección activa.
  {
    const concentrationFactor = 1 + (3 - Math.min(channelCount, 3)) * 0.06;
    const mid = monthlyRevenue * 0.08 * concentrationFactor * multiplier * boost('prospecting');
    const [min, max] = withRange(mid, 0.35);
    const cost = Math.round(mid * 0.22);
    opportunities.push({
      category: 'prospecting',
      name: 'Prospección activa de nuevos clientes',
      description: 'Búsqueda proactiva de negocios/personas con el perfil de tu cliente ideal.',
      potentialMin: min,
      potentialMax: max,
      difficulty: 'alta',
      estimatedDays: 14,
      probability: 'media',
      estimatedCost: cost,
      roiMultiple: roi(mid, cost),
      assumption: `Estimado sobre ${Math.round(monthlyRevenue).toLocaleString('es-ES')}€ de facturación mensual y ${channelCount} canal(es) de captación activos.`,
    });
  }

  // 4. Automatización comercial: recuperar capacidad de venta perdida en
  // tareas manuales de seguimiento repetitivo.
  {
    const mid = monthlyRevenue * 0.05 * multiplier * boost('automation');
    const [min, max] = withRange(mid, 0.25);
    const cost = Math.round(mid * 0.15);
    opportunities.push({
      category: 'automation',
      name: 'Automatizar seguimiento comercial',
      description: 'Respuestas y recordatorios automáticos (WhatsApp/email) para no perder ritmo con ningún lead.',
      potentialMin: min,
      potentialMax: max,
      difficulty: 'baja',
      estimatedDays: 5,
      probability: 'alta',
      estimatedCost: cost,
      roiMultiple: roi(mid, cost),
      assumption: `Estimado como el 5% de la facturación mensual recuperable al automatizar seguimiento repetitivo.`,
    });
  }

  // 5. Optimización de conversión: brecha entre la conversión actual y un
  // benchmark de referencia del sector.
  {
    const gap = Math.max(0, BENCHMARK_CONVERSION - conversionRate);
    const mid = gap * monthlyLeads * avgTicket * 0.6 * multiplier * boost('conversion_optimization');
    const [min, max] = withRange(mid, 0.3);
    const cost = Math.round(mid * 0.18);
    opportunities.push({
      category: 'conversion_optimization',
      name: 'Optimizar la conversión de leads',
      description: 'Ajustes en el proceso de cualificación y respuesta para cerrar más de los leads que ya llegan.',
      potentialMin: min,
      potentialMax: max,
      difficulty: 'media',
      estimatedDays: 12,
      probability: gap > 0.05 ? 'alta' : 'media',
      estimatedCost: cost,
      roiMultiple: roi(mid, cost),
      assumption: `Tu conversión actual (${Math.round(conversionRate * 100)}%) frente a un benchmark de referencia (${Math.round(BENCHMARK_CONVERSION * 100)}%).`,
    });
  }

  const totalPotentialMin = opportunities.reduce((s, o) => s + o.potentialMin, 0);
  const totalPotentialMax = opportunities.reduce((s, o) => s + o.potentialMax, 0);

  return { totalPotentialMin, totalPotentialMax, opportunities };
}
