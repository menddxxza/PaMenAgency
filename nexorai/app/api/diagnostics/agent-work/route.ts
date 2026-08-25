import { NextResponse } from 'next/server';
import { buildAgentWorkPrompt } from '@/lib/ai/provider';

export const dynamic = 'force-dynamic';

/**
 * Diagnóstico TEMPORAL para depurar por qué generateAgentWork cae a la
 * plantilla local en producción. Llama a Groq directamente (sin pasar por
 * la capa AIProvider) con distintos max_tokens para ver el finish_reason y
 * si el JSON se puede parsear. Borrar en cuanto se confirme el fix.
 */
export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY no configurada' });
  }

  const prompt = buildAgentWorkPrompt({
    businessName: 'Negocio Demo',
    sectorName: 'Inmobiliaria',
    mainProblem: 'Leads sin seguimiento',
    agentName: 'Follow-up Agent',
    agentObjective: 'Detectar leads olvidados',
    opportunityName: 'Leads sin seguimiento',
    opportunityDescription: 'Recupera leads inactivos que no han recibido respuesta',
    opportunityAssumption: 'Basado en los datos aportados por el negocio',
    goalLabel: '10 clientes nuevos en 30 días',
  });

  const attempts: unknown[] = [];

  for (const maxTokens of [2200, 4096]) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          max_tokens: maxTokens,
          reasoning_effort: 'low',
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json().catch(() => null);
      const content: string = data?.choices?.[0]?.message?.content ?? '';
      const finishReason = data?.choices?.[0]?.finish_reason ?? null;
      const cleaned = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
      let parseOk = false;
      let tasksCount: number | null = null;
      try {
        const parsed = JSON.parse(cleaned);
        parseOk = true;
        tasksCount = Array.isArray(parsed?.tasks) ? parsed.tasks.length : null;
      } catch {
        parseOk = false;
      }
      attempts.push({
        maxTokens,
        httpStatus: res.status,
        finishReason,
        usage: data?.usage ?? null,
        contentLength: content.length,
        contentPreview: content.slice(0, 500),
        parseOk,
        tasksCount,
      });
    } catch (err) {
      attempts.push({ maxTokens, exception: String(err) });
    }
  }

  return NextResponse.json({ attempts });
}
