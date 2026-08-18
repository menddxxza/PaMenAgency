const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Groq retiró los modelos Llama de chat de su catálogo; gpt-oss-120b es el
// modelo de razonamiento general más capaz que queda en la capa gratuita,
// necesario para juzgar bien si un producto encaja con lo que pide el
// usuario en vez de solo coincidir en palabras sueltas.
const MODELO = 'openai/gpt-oss-120b';

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
        max_tokens: 550,
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

/**
 * Amplía una búsqueda literal que ha encontrado poco o nada: le pide a Groq
 * términos relacionados (sinónimos, tecnologías, vocabulario del sector) para
 * intentar una segunda pasada. Devuelve null si no hay clave, si Groq falla,
 * o si la respuesta no es una lista de texto válida — nunca debe tumbar la
 * búsqueda normal, solo es una mejora opcional sobre ella.
 */
export async function expandirBusqueda(consulta: string): Promise<string[] | null> {
  const respuesta = await preguntarGroq([
    {
      role: 'system',
      content: `Eres un motor de sinónimos para el buscador de IAPyme, un marketplace de soluciones de IA para pymes en español.

Dada la búsqueda de un usuario, devuelve entre 3 y 6 palabras o expresiones cortas relacionadas (sinónimos, tecnologías habituales, vocabulario del sector) que ayuden a encontrar soluciones aunque no compartan las palabras exactas de la búsqueda.

Responde ÚNICAMENTE con un array JSON de strings, sin explicación ni texto adicional.
Ejemplo: ["chatbot", "atención al cliente", "whatsapp business"]`,
    },
    { role: 'user', content: consulta },
  ]);

  if (!respuesta) return null;

  try {
    const limpio = respuesta.trim().replace(/^```json\s*|```\s*$/g, '');
    const terminos: unknown = JSON.parse(limpio);
    if (!Array.isArray(terminos)) return null;

    return terminos
      .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
      .slice(0, 6);
  } catch {
    return null;
  }
}
