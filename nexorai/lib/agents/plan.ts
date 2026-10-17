import { getAIProvider } from '@/lib/ai/provider';
import type { OpportunityEstimate } from '@/lib/ai/audit-engine';
import type { AgentDefinition } from '@/lib/agents/catalog';

/**
 * Genera el plan de trabajo real de un agente recién activado: pide al
 * proveedor de IA configurado (Groq/Anthropic/OpenAI) contenido específico
 * del negocio (borradores de mensaje, análisis, pasos concretos), repartido
 * en el tiempo (día 0, 1, 3, 5, 10, 15) para alimentar el Revenue Timeline.
 *
 * No hay ningún conector externo real conectado en el MVP (WhatsApp/email/
 * CRM), así que nada de esto se envía a nadie todavía: es trabajo real de
 * IA en modo borrador, pendiente de revisión humana. Si no hay proveedor
 * configurado o la llamada falla, cae a una plantilla local genérica
 * (`generatedByModel: false`) sin inventar datos de negocio.
 *
 * Tampoco se generan leads/prospectos aquí: no hay fuente de datos real de
 * contactos conectada, así que inventar nombres de personas sería presentar
 * datos ficticios como reales.
 */

export interface PlannedTask {
  title: string;
  detail: string;
  dayOffset: number;
}

export interface WorkPlan {
  tasks: PlannedTask[];
  generatedByModel: boolean;
  provider: string;
}

const TIMELINE_DAYS = [0, 1, 3, 5, 10, 15];

export interface PlanContext {
  businessName: string;
  sectorName: string;
  mainProblem: string;
  goalLabel: string;
}

export async function planAgentWork(
  opportunity: OpportunityEstimate,
  agentDef: AgentDefinition,
  context: PlanContext
): Promise<WorkPlan> {
  const result = await getAIProvider().generateAgentWork({
    businessName: context.businessName,
    sectorName: context.sectorName,
    mainProblem: context.mainProblem,
    agentName: agentDef.name,
    agentObjective: agentDef.objective,
    opportunityName: opportunity.name,
    opportunityDescription: opportunity.description,
    opportunityAssumption: opportunity.assumption,
    goalLabel: context.goalLabel,
  });

  const tasks: PlannedTask[] = TIMELINE_DAYS.map((dayOffset, i) => {
    const draft = result.tasks[i] ?? result.tasks[result.tasks.length - 1];
    return { title: draft.title, detail: draft.detail, dayOffset };
  });

  return { tasks, generatedByModel: result.generatedByModel, provider: result.provider };
}

/**
 * Reparte el potencial de ingreso ya calculado por el audit engine
 * (determinista, real) a lo largo de la misma línea de tiempo, con más peso
 * en los últimos hitos (los de cierre). No inventa ingresos: la suma de los
 * importes es el punto medio del rango real de la oportunidad.
 */
export function distributePotentialRevenue(
  opportunity: Pick<OpportunityEstimate, 'potentialMin' | 'potentialMax'>
): { dayOffset: number; amount: number }[] {
  const mid = (opportunity.potentialMin + opportunity.potentialMax) / 2;
  const weights = [0.05, 0.1, 0.15, 0.2, 0.2, 0.3];
  return TIMELINE_DAYS.map((dayOffset, i) => ({ dayOffset, amount: Math.round(mid * weights[i]) }));
}
