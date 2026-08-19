import type { WebsiteStatus } from '@/lib/types';

/**
 * Clasificación opcional de "web antigua" mediante IA. Se activa con
 * ENABLE_AI_QUALITY_CHECK=true. Analiza el HTML de la home y pide al
 * modelo un veredicto simple para no gastar tokens en páginas ya
 * detectadas como no_website / social_only / broken.
 */

export function aiQualityCheckEnabled(): boolean {
  return process.env.ENABLE_AI_QUALITY_CHECK === 'true';
}

const PROMPT = `Eres un auditor de webs. Te paso un fragmento del HTML de la home de un negocio local.
Responde EXCLUSIVAMENTE "outdated" o "active" (sin comillas ni explicación).
Considera "outdated" si detectas señales claras de una web anticuada: tablas para maquetar,
Flash, marcos <frame>, meta generator de builders obsoletos, ausencia total de viewport
responsive, copyright de hace más de 5 años, o diseño roto/sin CSS aparente.
Si no hay señales claras, responde "active".

HTML:
`;

async function classifyWithAnthropic(html: string): Promise<'outdated' | 'active' | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8,
      messages: [{ role: 'user', content: PROMPT + html }],
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.content?.[0]?.text?.trim().toLowerCase();
  return text === 'outdated' ? 'outdated' : text === 'active' ? 'active' : null;
}

async function classifyWithOpenAI(html: string): Promise<'outdated' | 'active' | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 8,
      messages: [{ role: 'user', content: PROMPT + html }],
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content?.trim().toLowerCase();
  return text === 'outdated' ? 'outdated' : text === 'active' ? 'active' : null;
}

/**
 * Devuelve 'outdated' si la IA detecta señales de web anticuada, o el
 * status original si no se puede evaluar (feature desactivada, sin API key,
 * fallo de red, timeout, etc.) — nunca lanza. Reutiliza el HTML ya
 * descargado durante checkWebsite() en vez de volver a pedirlo.
 */
export async function maybeReclassifyOutdated(
  html: string | null,
  currentStatus: WebsiteStatus
): Promise<WebsiteStatus> {
  if (currentStatus !== 'active' || !aiQualityCheckEnabled() || !html) {
    return currentStatus;
  }

  const snippet = html.slice(0, 6000);
  const provider = process.env.AI_PROVIDER === 'openai' ? classifyWithOpenAI : classifyWithAnthropic;
  const verdict = await provider(snippet).catch(() => null);

  return verdict === 'outdated' ? 'outdated' : currentStatus;
}
