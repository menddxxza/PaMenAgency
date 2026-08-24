import type { OpportunityEstimate } from '@/lib/ai/audit-engine';

/**
 * Genera el plan de trabajo simulado de un agente recién activado: tareas
 * distribuidas en el tiempo (día 0, 1, 3, 5, 10, 15) que alimentan el Revenue
 * Timeline, más leads e ingreso potencial de demostración.
 *
 * Todo lo que produce esta función lleva `isSimulated: true` y nunca debe
 * tratarse como resultado real en la UI: no hay ningún conector externo
 * (WhatsApp/email/CRM) conectado en el MVP, así que no hay ninguna acción
 * irreversible real que autorizar todavía.
 */

export interface SimulatedTask {
  title: string;
  dayOffset: number;
  isSimulated: true;
}

export interface SimulatedLead {
  name: string;
  source: string;
  estimatedValue: number;
  isSimulated: true;
}

export interface SimulationPlan {
  tasks: SimulatedTask[];
  leads: SimulatedLead[];
  potentialRevenueByDay: { dayOffset: number; amount: number }[];
}

const TIMELINE_DAYS = [0, 1, 3, 5, 10, 15];

const NARRATIVE_BY_CATEGORY: Record<string, string[]> = {
  unfollowed_leads: [
    'Analiza el histórico de leads sin respuesta',
    'Identifica leads con mayor probabilidad de recuperar',
    'Prepara mensajes de reenganche',
    'Envía el primer contacto de recuperación',
    'Registra respuestas y agenda seguimientos',
    'Consolida leads recuperados en el pipeline',
  ],
  reactivation: [
    'Segmenta la cartera de clientes inactivos',
    'Prioriza clientes con mayor probabilidad de volver',
    'Diseña la oferta de reactivación',
    'Lanza la primera oleada de contacto',
    'Da seguimiento a quienes respondieron',
    'Cierra las primeras reactivaciones',
  ],
  prospecting: [
    'Define el perfil de cliente ideal a prospectar',
    'Encuentra los primeros prospectos que encajan',
    'Enriquece datos de contacto de cada prospecto',
    'Envía el primer acercamiento comercial',
    'Cualifica respuestas recibidas',
    'Agenda las primeras reuniones comerciales',
  ],
  automation: [
    'Mapea los puntos de seguimiento manual actuales',
    'Configura las respuestas automáticas base',
    'Activa recordatorios de seguimiento automático',
    'Revisa las primeras conversaciones automatizadas',
    'Ajusta plantillas según resultados',
    'Consolida ahorro de tiempo comercial',
  ],
  conversion_optimization: [
    'Audita el proceso de conversión actual',
    'Detecta los puntos de fuga principales',
    'Propone ajustes al proceso de cualificación',
    'Aplica los ajustes a los leads entrantes',
    'Mide el impacto en la tasa de conversión',
    'Consolida la mejora de conversión',
  ],
};

function estimateLeadCount(opportunity: OpportunityEstimate): number {
  const mid = (opportunity.potentialMin + opportunity.potentialMax) / 2;
  const impliedTicket = mid / 6; // se reparte el potencial entre ~6 leads de demostración
  return Math.max(3, Math.min(12, Math.round(mid / Math.max(impliedTicket, 1))));
}

export function simulateAgentWork(opportunity: OpportunityEstimate): SimulationPlan {
  const narrative = NARRATIVE_BY_CATEGORY[opportunity.category] ?? NARRATIVE_BY_CATEGORY.automation;

  const tasks: SimulatedTask[] = TIMELINE_DAYS.map((dayOffset, i) => ({
    title: narrative[i] ?? `Continúa el trabajo sobre "${opportunity.name}"`,
    dayOffset,
    isSimulated: true,
  }));

  const leadCount = estimateLeadCount(opportunity);
  const mid = (opportunity.potentialMin + opportunity.potentialMax) / 2;
  const perLeadValue = Math.round(mid / leadCount);

  const leads: SimulatedLead[] = Array.from({ length: leadCount }, (_, i) => ({
    name: `Prospecto demo ${i + 1}`,
    source: opportunity.name,
    estimatedValue: perLeadValue,
    isSimulated: true,
  }));

  // El ingreso potencial se reconoce de forma progresiva a lo largo de la
  // línea de tiempo (más peso en los últimos hitos, que son los de cierre).
  const weights = [0.05, 0.1, 0.15, 0.2, 0.2, 0.3];
  const potentialRevenueByDay = TIMELINE_DAYS.map((dayOffset, i) => ({
    dayOffset,
    amount: Math.round(mid * weights[i]),
  }));

  return { tasks, leads, potentialRevenueByDay };
}
