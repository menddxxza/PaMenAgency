/**
 * Cliente mínimo de OpenAI (o de cualquier servidor compatible) sobre fetch.
 *
 * No se instala el SDK a propósito: Notiq hace dos llamadas (chat completions con y
 * sin JSON forzado) y el SDK son ~4 MB en el bundle del servidor que hay que mantener
 * al día. Si algún día hacen falta streaming de audio o assistants, se cambia.
 *
 * OPENAI_BASE_URL permite apuntar a un servidor de IA en local (Ollama, LM Studio,
 * llama.cpp, vLLM...) en vez de a OpenAI: casi todos exponen una API compatible con
 * la de OpenAI en /v1/chat/completions, solo cambia la dirección. La clave sigue
 * haciendo falta como cabecera (Authorization: Bearer ...) aunque el servidor local
 * no la valide de verdad — basta con poner cualquier texto no vacío.
 */
const BASE_URL = (process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/+$/, '');
const ENDPOINT = `${BASE_URL}/chat/completions`;
const ENDPOINT_RESPUESTAS = `${BASE_URL}/responses`;

/** Barato y suficiente para resumir y extraer tareas. Ver README para los costes.
 * Con un servidor en local, aquí va el nombre del modelo que sirva ese servidor
 * (p. ej. "llama3.1" en Ollama), no un modelo de OpenAI. */
export const MODELO = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

export type Mensaje = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export class ErrorIA extends Error {
  constructor(
    message: string,
    readonly estado = 502,
  ) {
    super(message);
    this.name = 'ErrorIA';
  }
}

export function iaConfigurada(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

type Opciones = {
  mensajes: Mensaje[];
  /** Fuerza que la respuesta sea un objeto JSON válido. */
  json?: boolean;
  temperatura?: number;
  maxTokens?: number;
};

export async function completar({
  mensajes,
  json = false,
  temperatura = 0.3,
  maxTokens = 1200,
}: Opciones): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ErrorIA('La IA no está configurada en este despliegue.', 503);
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODELO,
        messages: mensajes,
        temperature: temperatura,
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      }),
      // Sin esto una petición colgada bloquea el route handler hasta el timeout
      // de la plataforma, que es mucho más largo que la paciencia del usuario.
      // Más margen que con la API de OpenAI porque un modelo en local (sobre todo
      // sin GPU) puede tardar bastante más en generar la misma respuesta.
      signal: AbortSignal.timeout(90_000),
    });
  } catch {
    throw new ErrorIA('No se ha podido contactar con el proveedor de IA.', 504);
  }

  if (!respuesta.ok) {
    // 429 del proveedor es distinto de 429 nuestro (cuota del plan), pero para el
    // usuario significa lo mismo: reintentar en un momento.
    const estado = respuesta.status === 429 ? 429 : 502;
    throw new ErrorIA('El proveedor de IA ha devuelto un error.', estado);
  }

  const datos = (await respuesta.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const contenido = datos.choices?.[0]?.message?.content?.trim();

  if (!contenido) throw new ErrorIA('La IA ha devuelto una respuesta vacía.');
  return contenido;
}

/**
 * Igual que `completar`, pero con el buscador web integrado de OpenAI disponible:
 * el propio modelo decide en cada pregunta si necesita buscar en internet antes de
 * responder (algo actual, un dato que no sabe de memoria...) o si le basta con el
 * contexto que se le ha dado. Solo funciona contra la API real de OpenAI — los
 * servidores compatibles en local (Ollama, LM Studio...) no exponen buscador, así
 * que ahí se cae a `completar` sin más.
 *
 * Usa el endpoint /responses (no /chat/completions) porque el buscador integrado
 * solo existe ahí. La forma de la respuesta es distinta a la de chat completions:
 * un array `output` con los pasos que ha dado el modelo (llamadas al buscador,
 * mensaje final...), así que hay que quedarse solo con el texto del mensaje.
 */
export async function completarConBusqueda({
  mensajes,
  temperatura = 0.4,
  maxTokens = 1200,
}: Omit<Opciones, 'json'>): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ErrorIA('La IA no está configurada en este despliegue.', 503);
  }

  if (process.env.OPENAI_BASE_URL) {
    return completar({ mensajes, temperatura, maxTokens });
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(ENDPOINT_RESPUESTAS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODELO,
        input: mensajes,
        tools: [{ type: 'web_search_preview' }],
        temperature: temperatura,
        max_output_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(90_000),
    });
  } catch {
    throw new ErrorIA('No se ha podido contactar con el proveedor de IA.', 504);
  }

  if (!respuesta.ok) {
    const estado = respuesta.status === 429 ? 429 : 502;
    throw new ErrorIA('El proveedor de IA ha devuelto un error.', estado);
  }

  const datos = (await respuesta.json()) as {
    output?: { type: string; content?: { type: string; text?: string }[] }[];
  };

  const contenido = datos.output
    ?.filter((paso) => paso.type === 'message')
    .flatMap((paso) => paso.content ?? [])
    .filter((bloque) => bloque.type === 'output_text')
    .map((bloque) => bloque.text ?? '')
    .join('\n')
    .trim();

  if (!contenido) throw new ErrorIA('La IA ha devuelto una respuesta vacía.');
  return contenido;
}

/** Igual que `completar`, pero devolviendo JSON ya parseado. */
export async function completarJson<T>(opciones: Omit<Opciones, 'json'>): Promise<T> {
  const bruto = await completar({ ...opciones, json: true });
  try {
    return JSON.parse(bruto) as T;
  } catch {
    throw new ErrorIA('La IA ha devuelto un JSON que no se puede leer.');
  }
}
