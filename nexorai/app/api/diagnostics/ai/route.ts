import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Diagnóstico temporal: confirma qué proveedor de IA resuelve el servidor,
 * si cada API key está presente (sin exponer su valor), y hace una llamada
 * real y barata a Groq para ver si responde o por qué falla. Pensado para
 * depurar por qué el audit sigue en "plantilla local" sin depender de leer
 * los Function Logs de Vercel. Visitar directamente en el navegador:
 * /api/diagnostics/ai
 */
export async function GET() {
  const configuredProvider = (process.env.AI_PROVIDER ?? 'groq (por defecto)').toLowerCase();
  const groqKey = process.env.GROQ_API_KEY;

  let groqTest: unknown = 'GROQ_API_KEY no configurada, no se probó.';
  let groqModels: unknown = 'GROQ_API_KEY no configurada, no se listaron modelos.';

  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Responde solo con la palabra: ok' }],
        }),
      });
      const bodyText = await res.text();
      groqTest = {
        status_http: res.status,
        ok: res.ok,
        respuesta: bodyText.slice(0, 500),
      };
    } catch (err) {
      groqTest = { error: String(err) };
    }

    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${groqKey}` },
      });
      const data = await res.json();
      groqModels = res.ok
        ? (data?.data ?? []).map((m: { id: string }) => m.id)
        : { status_http: res.status, respuesta: JSON.stringify(data).slice(0, 500) };
    } catch (err) {
      groqModels = { error: String(err) };
    }
  }

  return NextResponse.json({
    proveedor_resuelto: configuredProvider,
    GROQ_API_KEY_presente: Boolean(process.env.GROQ_API_KEY),
    OPENAI_API_KEY_presente: Boolean(process.env.OPENAI_API_KEY),
    ANTHROPIC_API_KEY_presente: Boolean(process.env.ANTHROPIC_API_KEY),
    prueba_real_groq: groqTest,
    modelos_disponibles_groq: groqModels,
  });
}
