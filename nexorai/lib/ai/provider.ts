import type { GoalInput } from '@/lib/types';

/**
 * Capa de IA desacoplada de proveedor. El resto de la app nunca importa un
 * SDK de un modelo concreto: pide `getAIProvider()` y llama a
 * `summarizeAudit`. Cambiar de proveedor es cambiar `AI_PROVIDER` en el
 * entorno, no reescribir código.
 *
 * Importante: esta capa NUNCA calcula cifras de negocio. Sólo redacta un
 * resumen en lenguaje natural a partir de números ya calculados de forma
 * determinista por `lib/ai/audit-engine.ts`. Así se evita que un modelo
 * "invente" un potencial de ingresos.
 */

export interface AuditSummaryInput {
  businessName: string;
  sectorName: string;
  goal: Pick<GoalInput, 'goalType' | 'targetValue' | 'timeframeDays'>;
  totalPotentialMin: number;
  totalPotentialMax: number;
  topOpportunityNames: string[];
}

export interface AISummaryResult {
  text: string;
  /** false cuando es una plantilla local (sin proveedor configurado). */
  generatedByModel: boolean;
  provider: AIProviderId;
}

/** Contexto real de negocio/oportunidad para que el agente redacte trabajo específico. */
export interface AgentWorkInput {
  businessName: string;
  sectorName: string;
  mainProblem: string;
  agentName: string;
  agentObjective: string;
  opportunityName: string;
  opportunityDescription: string;
  opportunityAssumption: string;
  goalLabel: string;
}

export interface AgentTaskDraft {
  /** Título corto de la tarea (para la línea de tiempo). */
  title: string;
  /** Contenido real: borrador de mensaje, guion o análisis listo para revisar/usar. */
  detail: string;
}

export interface AgentWorkResult {
  tasks: AgentTaskDraft[];
  /** false cuando es la plantilla local de respaldo (sin proveedor o fallo de IA). */
  generatedByModel: boolean;
  provider: AIProviderId;
}

export type AIProviderId = 'anthropic' | 'openai' | 'groq' | 'mock';

export interface AIProvider {
  readonly id: AIProviderId;
  summarizeAudit(input: AuditSummaryInput): Promise<AISummaryResult>;
  generateAgentWork(input: AgentWorkInput): Promise<AgentWorkResult>;
}

export function goalLabel(goal: AuditSummaryInput['goal']): string {
  switch (goal.goalType) {
    case 'new_customers':
      return `${goal.targetValue} clientes nuevos en ${goal.timeframeDays} días`;
    case 'revenue':
      return `${goal.targetValue}€ adicionales en ${goal.timeframeDays} días`;
    case 'leads':
      return `${goal.targetValue} leads nuevos en ${goal.timeframeDays} días`;
    case 'reactivation':
      return `recuperar clientes antiguos en ${goal.timeframeDays} días`;
  }
}

function buildTemplateSummary(input: AuditSummaryInput): string {
  const top = input.topOpportunityNames.slice(0, 3).join(', ');
  return (
    `${input.businessName} tiene un potencial estimado de entre ${Math.round(input.totalPotentialMin).toLocaleString('es-ES')}€ ` +
    `y ${Math.round(input.totalPotentialMax).toLocaleString('es-ES')}€ al mes, calculado a partir de los datos aportados. ` +
    `Las oportunidades con más impacto son: ${top}. ` +
    `Activar los agentes correspondientes es el camino más directo hacia el objetivo declarado: ${goalLabel(input.goal)}.`
  );
}

const WORK_TIMELINE_DAYS = [0, 1, 3, 5, 10, 15];

function buildTemplateAgentWork(input: AgentWorkInput): AgentTaskDraft[] {
  const steps = [
    `Revisa la situación actual de "${input.opportunityName}" en ${input.businessName}`,
    `Prepara el primer borrador de trabajo para ${input.agentObjective.toLowerCase()}`,
    'Ajusta el enfoque según los primeros resultados',
    'Da seguimiento a lo iniciado en el paso anterior',
    'Consolida avances y detecta el siguiente cuello de botella',
    `Deja el resultado listo para revisar antes del cierre del objetivo: ${input.goalLabel}`,
  ];
  return WORK_TIMELINE_DAYS.map((_, i) => ({
    title: steps[i],
    detail:
      'Plantilla local: activa un proveedor de IA (GROQ_API_KEY, ANTHROPIC_API_KEY u OPENAI_API_KEY) ' +
      'para que este agente redacte trabajo real y específico de tu negocio.',
  }));
}

export function buildAgentWorkPrompt(input: AgentWorkInput): string {
  return (
    `Eres "${input.agentName}", un agente de crecimiento B2B cuyo objetivo es: ${input.agentObjective}\n\n` +
    `Negocio: ${input.businessName} (sector: ${input.sectorName})\n` +
    `Problema principal declarado por el negocio: ${input.mainProblem || 'no especificado'}\n` +
    `Oportunidad que estás trabajando: ${input.opportunityName} — ${input.opportunityDescription}\n` +
    `Base de la estimación (no la repitas ni inventes cifras nuevas): ${input.opportunityAssumption}\n` +
    `Objetivo de crecimiento del negocio: ${input.goalLabel}\n\n` +
    `Genera un plan de trabajo real de exactamente 6 pasos, repartidos desde hoy hasta el día 15, ` +
    `que este agente ejecutaría de verdad. Para cada paso escribe:\n` +
    `- "title": acción corta (máx 10 palabras)\n` +
    `- "detail": el contenido real y específico de esa acción — si implica contactar a alguien, ` +
    `escribe el borrador de mensaje completo listo para usar (en español, tono profesional, sin inventar ` +
    `nombres de personas ni empresas reales, sin prometer resultados garantizados); si es análisis, ` +
    `escribe el análisis o los criterios reales que aplicarías con los datos de este negocio.\n\n` +
    `Responde ÚNICAMENTE con JSON válido, sin texto adicional ni markdown, con esta forma exacta:\n` +
    `{"tasks":[{"title":"...","detail":"..."}, ... 6 elementos ...]}`
  );
}

function parseAgentWorkResponse(raw: string): AgentTaskDraft[] | null {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  try {
    const parsed = JSON.parse(cleaned);
    const tasks = parsed?.tasks;
    if (!Array.isArray(tasks) || tasks.length === 0) return null;
    const valid = tasks
      .filter((t): t is { title: unknown; detail: unknown } => typeof t === 'object' && t !== null)
      .map((t) => ({ title: String(t.title ?? '').trim(), detail: String(t.detail ?? '').trim() }))
      .filter((t) => t.title && t.detail);
    return valid.length > 0 ? valid : null;
  } catch {
    return null;
  }
}

class MockAIProvider implements AIProvider {
  readonly id: AIProviderId = 'mock';

  async summarizeAudit(input: AuditSummaryInput): Promise<AISummaryResult> {
    return { text: buildTemplateSummary(input), generatedByModel: false, provider: this.id };
  }

  async generateAgentWork(input: AgentWorkInput): Promise<AgentWorkResult> {
    return { tasks: buildTemplateAgentWork(input), generatedByModel: false, provider: this.id };
  }
}

class AnthropicAIProvider implements AIProvider {
  readonly id: AIProviderId = 'anthropic';

  private async complete(prompt: string, maxTokens: number): Promise<string | null> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('[ai/provider] anthropic: ANTHROPIC_API_KEY no está configurada, cayendo a plantilla local.');
      return null;
    }
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) {
        console.error('[ai/provider] anthropic: respuesta no OK', res.status, await res.text().catch(() => ''));
        return null;
      }
      const data = await res.json();
      const text = data?.content?.[0]?.text?.trim();
      if (!text) {
        console.error('[ai/provider] anthropic: respuesta sin texto', JSON.stringify(data));
        return null;
      }
      return text;
    } catch (err) {
      console.error('[ai/provider] anthropic: excepción', err);
      return null;
    }
  }

  async summarizeAudit(input: AuditSummaryInput): Promise<AISummaryResult> {
    const text = await this.complete(buildPrompt(input), 220);
    if (!text) return new MockAIProvider().summarizeAudit(input);
    return { text, generatedByModel: true, provider: this.id };
  }

  async generateAgentWork(input: AgentWorkInput): Promise<AgentWorkResult> {
    const raw = await this.complete(buildAgentWorkPrompt(input), 1400);
    const tasks = raw ? parseAgentWorkResponse(raw) : null;
    if (!tasks) return new MockAIProvider().generateAgentWork(input);
    return { tasks, generatedByModel: true, provider: this.id };
  }
}

class OpenAIProvider implements AIProvider {
  readonly id: AIProviderId = 'openai';

  private async complete(prompt: string, maxTokens: number): Promise<string | null> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[ai/provider] openai: OPENAI_API_KEY no está configurada, cayendo a plantilla local.');
      return null;
    }
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) {
        console.error('[ai/provider] openai: respuesta no OK', res.status, await res.text().catch(() => ''));
        return null;
      }
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.trim();
      if (!text) {
        console.error('[ai/provider] openai: respuesta sin texto', JSON.stringify(data));
        return null;
      }
      return text;
    } catch (err) {
      console.error('[ai/provider] openai: excepción', err);
      return null;
    }
  }

  async summarizeAudit(input: AuditSummaryInput): Promise<AISummaryResult> {
    const text = await this.complete(buildPrompt(input), 220);
    if (!text) return new MockAIProvider().summarizeAudit(input);
    return { text, generatedByModel: true, provider: this.id };
  }

  async generateAgentWork(input: AgentWorkInput): Promise<AgentWorkResult> {
    const raw = await this.complete(buildAgentWorkPrompt(input), 1400);
    const tasks = raw ? parseAgentWorkResponse(raw) : null;
    if (!tasks) return new MockAIProvider().generateAgentWork(input);
    return { tasks, generatedByModel: true, provider: this.id };
  }
}

// llama-3.1-8b-instant y llama-3.3-70b-versatile pasaron a plan Enterprise
// de Groq (404 model_not_found en cuentas gratuitas) — confirmado en
// console.groq.com/docs/models el 2026-08-25. Los modelos openai/gpt-oss-*
// siguen en el plan gratuito/pay-as-you-go normal, pero son modelos de
// "razonamiento": gastan tokens pensando antes de escribir la respuesta
// final, así que necesitan reasoning_effort bajo + más margen de tokens o
// el content vuelve vacío (finish_reason "length") con max_tokens chico.
const GROQ_MODEL_FALLBACKS: { model: string; reasoningEffort?: 'low' | 'medium' | 'high' }[] = [
  { model: 'openai/gpt-oss-20b', reasoningEffort: 'low' },
  { model: 'openai/gpt-oss-120b', reasoningEffort: 'low' },
  { model: 'groq/compound-mini' },
];

class GroqProvider implements AIProvider {
  readonly id: AIProviderId = 'groq';

  private async complete(prompt: string, maxTokens: number): Promise<string | null> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('[ai/provider] groq: GROQ_API_KEY no está configurada, cayendo a plantilla local.');
      return null;
    }

    for (const { model, reasoningEffort } of GROQ_MODEL_FALLBACKS) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
            messages: [{ role: 'user', content: prompt }],
          }),
        });
        if (!res.ok) {
          console.error('[ai/provider] groq: respuesta no OK', model, res.status, await res.text().catch(() => ''));
          continue;
        }
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (!text) {
          console.error('[ai/provider] groq: respuesta sin texto', model, JSON.stringify(data));
          continue;
        }
        return text;
      } catch (err) {
        console.error('[ai/provider] groq: excepción', model, err);
      }
    }

    return null;
  }

  async summarizeAudit(input: AuditSummaryInput): Promise<AISummaryResult> {
    const text = await this.complete(buildPrompt(input), 700);
    if (!text) return new MockAIProvider().summarizeAudit(input);
    return { text, generatedByModel: true, provider: this.id };
  }

  async generateAgentWork(input: AgentWorkInput): Promise<AgentWorkResult> {
    const raw = await this.complete(buildAgentWorkPrompt(input), 2200);
    const tasks = raw ? parseAgentWorkResponse(raw) : null;
    if (!tasks) return new MockAIProvider().generateAgentWork(input);
    return { tasks, generatedByModel: true, provider: this.id };
  }
}

function buildPrompt(input: AuditSummaryInput): string {
  return (
    `Eres un analista de crecimiento B2B. Te doy cifras YA CALCULADAS de un negocio; ` +
    `redacta un resumen ejecutivo de 3-4 frases en español, tono directo y profesional, ` +
    `sin inventar cifras nuevas ni prometer resultados garantizados.\n\n` +
    `Negocio: ${input.businessName} (${input.sectorName})\n` +
    `Objetivo declarado: ${goalLabel(input.goal)}\n` +
    `Potencial mensual estimado: ${Math.round(input.totalPotentialMin)}€ - ${Math.round(input.totalPotentialMax)}€\n` +
    `Principales oportunidades: ${input.topOpportunityNames.join(', ')}\n`
  );
}

export function getAIProvider(): AIProvider {
  const configured = (process.env.AI_PROVIDER ?? 'groq').toLowerCase();
  if (configured === 'anthropic') return new AnthropicAIProvider();
  if (configured === 'openai') return new OpenAIProvider();
  if (configured === 'groq') return new GroqProvider();
  return new MockAIProvider();
}
