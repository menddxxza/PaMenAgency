import type { AgentKey, OpportunityCategory } from '@/lib/types';

export interface AgentDefinition {
  key: AgentKey;
  name: string;
  objective: string;
  description: string;
  tools: string[];
  permissions: string[];
  /** Categoría de oportunidad que activa este agente; null = transversal (siempre disponible). */
  triggersFor: OpportunityCategory | null;
}

export const AGENT_CATALOG: AgentDefinition[] = [
  {
    key: 'lead_hunter',
    name: 'Lead Hunter',
    objective: 'Encontrar oportunidades comerciales nuevas.',
    description:
      'Rastrea tus canales de captación y el mercado local para encontrar prospectos que encajan con tu cliente ideal.',
    tools: ['Búsqueda de negocios/contactos', 'Enriquecimiento de datos públicos'],
    permissions: ['Leer configuración del negocio', 'Crear leads'],
    triggersFor: 'prospecting',
  },
  {
    key: 'lead_qualifier',
    name: 'Lead Qualifier',
    objective: 'Clasificar y priorizar leads entrantes.',
    description: 'Puntúa cada lead según probabilidad de cierre para que el equipo comercial priorice bien su tiempo.',
    tools: ['Scoring de leads', 'Segmentación'],
    permissions: ['Leer leads', 'Actualizar estado de leads'],
    triggersFor: 'conversion_optimization',
  },
  {
    key: 'sales_assistant',
    name: 'Sales Assistant',
    objective: 'Preparar respuestas y seguimiento comercial.',
    description: 'Redacta borradores de respuesta y recordatorios de seguimiento listos para revisar y enviar.',
    tools: ['Generación de mensajes', 'Plantillas de seguimiento'],
    permissions: ['Leer conversaciones', 'Crear borradores (requieren aprobación para enviarse)'],
    triggersFor: 'automation',
  },
  {
    key: 'follow_up',
    name: 'Follow-up Agent',
    objective: 'Detectar leads olvidados.',
    description: 'Revisa leads sin actividad reciente y los marca para retomar el contacto antes de que se enfríen del todo.',
    tools: ['Detección de inactividad', 'Alertas de seguimiento'],
    permissions: ['Leer leads', 'Crear tareas de seguimiento'],
    triggersFor: 'unfollowed_leads',
  },
  {
    key: 'reactivation',
    name: 'Reactivation Agent',
    objective: 'Buscar clientes antiguos reactivables.',
    description: 'Identifica clientes inactivos con mayor probabilidad de volver a comprar y prepara la campaña de reactivación.',
    tools: ['Segmentación de cartera', 'Campañas de reactivación'],
    permissions: ['Leer clientes', 'Crear campañas'],
    triggersFor: 'reactivation',
  },
  {
    key: 'revenue_analyst',
    name: 'Revenue Analyst',
    objective: 'Analizar resultados y ROI.',
    description: 'Consolida los resultados de todos los agentes y mantiene actualizado el dashboard de ingresos.',
    tools: ['Agregación de métricas', 'Cálculo de ROI'],
    permissions: ['Leer todos los datos de la organización'],
    triggersFor: null,
  },
];

export function getAgentDefinition(key: AgentKey): AgentDefinition {
  const def = AGENT_CATALOG.find((a) => a.key === key);
  if (!def) throw new Error(`Agente desconocido: ${key}`);
  return def;
}

export function agentForCategory(category: OpportunityCategory): AgentDefinition {
  const def = AGENT_CATALOG.find((a) => a.triggersFor === category);
  if (!def) throw new Error(`No hay agente asignado a la categoría: ${category}`);
  return def;
}
