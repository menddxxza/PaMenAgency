const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Llama 3.3 70B en la capa gratuita de Groq: rápido y suficientemente
// capaz para elegir entre un catálogo corto, sin coste mientras el uso
// se mantenga dentro de los límites gratuitos.
const MODELO = 'llama-3.3-70b-versatile';

type Mensaje = { role: 'system' | 'user'; content: string };

/**
 * Envía una conversación a Groq y devuelve el texto de respuesta.
 * Devuelve null si no hay clave configurada o si Groq falla — el llamador
 * decide cómo degradar, nunca revienta la petición del usuario.
 */
export async function preguntarGroq(mensajes: Mensaje[]): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.info('[groq] GROQ_API_KEY no configurada, asistente omitido');
    return null;
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODELO,
        messages: mensajes,
        temperature: 0.3,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      console.error('[groq] respuesta no ok:', res.status, await res.text());
      return null;
    }

    const datos = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return datos.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (error) {
    console.error('[groq] fallo de red:', error);
    return null;
  }
}
