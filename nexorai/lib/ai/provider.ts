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

export type AIProviderId = 'anthropic' | 'openai' | 'groq' | 'mock';

export interface AIProvider {
  readonly id: AIProviderId;
  summarizeAudit(input: AuditSummaryInput): Promise<AISummaryResult>;
}

function goalLabel(goal: AuditSummaryInput['goal']): string {
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

class MockAIProvider implements AIProvider {
  readonly id: AIProviderId = 'mock';

  async summarizeAudit(input: AuditSummaryInput): Promise<AISummaryResult> {
    return { text: buildTemplateSummary(input), generatedByModel: false, provider: this.id };
  }
}

class AnthropicAIProvider implements AIProvider {
  readonly id: AIProviderId = 'anthropic';

  async summarizeAudit(input: AuditSummaryInput): Promise<AISummaryResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('[ai/provider] anthropic: ANTHROPIC_API_KEY no está configurada, cayendo a plantilla local.');
      return new MockAIProvider().summarizeAudit(input);
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
          max_tokens: 220,
          messages: [{ role: 'user', content: buildPrompt(input) }],
        }),
      });
      if (!res.ok) {
        console.error('[ai/provider] anthropic: respuesta no OK', res.status, await res.text().catch(() => ''));
        return new MockAIProvider().summarizeAudit(input);
      }
      const data = await res.json();
      const text = data?.content?.[0]?.text?.trim();
      if (!text) {
        console.error('[ai/provider] anthropic: respuesta sin texto', JSON.stringify(data));
        return new MockAIProvider().summarizeAudit(input);
      }
      return { text, generatedByModel: true, provider: this.id };
    } catch (err) {
      console.error('[ai/provider] anthropic: excepción', err);
      return new MockAIProvider().summarizeAudit(input);
    }
  }
}

class OpenAIProvider implements AIProvider {
  readonly id: AIProviderId = 'openai';

  async summarizeAudit(input: AuditSummaryInput): Promise<AISummaryResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[ai/provider] openai: OPENAI_API_KEY no está configurada, cayendo a plantilla local.');
      return new MockAIProvider().summarizeAudit(input);
    }

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 220,
          messages: [{ role: 'user', content: buildPrompt(input) }],
        }),
      });
      if (!res.ok) {
        console.error('[ai/provider] openai: respuesta no OK', res.status, await res.text().catch(() => ''));
        return new MockAIProvider().summarizeAudit(input);
      }
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.trim();
      if (!text) {
        console.error('[ai/provider] openai: respuesta sin texto', JSON.stringify(data));
        return new MockAIProvider().summarizeAudit(input);
      }
      return { text, generatedByModel: true, provider: this.id };
    } catch (err) {
      console.error('[ai/provider] openai: excepción', err);
      return new MockAIProvider().summarizeAudit(input);
    }
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

  async summarizeAudit(input: AuditSummaryInput): Promise<AISummaryResult> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('[ai/provider] groq: GROQ_API_KEY no está configurada, cayendo a plantilla local.');
      return new MockAIProvider().summarizeAudit(input);
    }

    for (const { model, reasoningEffort } of GROQ_MODEL_FALLBACKS) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            max_tokens: 700,
            ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
            messages: [{ role: 'user', content: buildPrompt(input) }],
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
        return { text, generatedByModel: true, provider: this.id };
      } catch (err) {
        console.error('[ai/provider] groq: excepción', model, err);
      }
    }

    return new MockAIProvider().summarizeAudit(input);
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
