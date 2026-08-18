/**
 * Cliente mínimo de OpenAI (o de cualquier servidor compatible) sobre fetch.
 *
 * No se instala el SDK a propósito: Notiq hace dos llamadas (chat completions con y
 * sin JSON forzado) y el SDK son ~4 MB en el bundle del servidor que hay que mantener
 * al día. Si algún día hacen falta streaming de audio o assistants, se cambia.
 *
 * Groq es el proveedor por defecto (rápido, con plan gratuito, y su modelo
 * "compound" trae buscador web integrado sin depender de nada más). Basta con
 * poner una `OPENAI_API_KEY` de https://console.groq.com y ya funciona todo —
 * `OPENAI_MODEL` y `OPENAI_MODEL_ASISTENTE` de abajo ya vienen puestos al modelo
 * correcto de Groq para cada caso, sin tocar nada más.
 *
 * `OPENAI_BASE_URL` permite cambiar a la API real de OpenAI, a otro proveedor
 * compatible o a un servidor en local (Ollama, LM Studio, llama.cpp, vLLM...) — casi
 * todos exponen una API compatible con la de OpenAI en /v1/chat/completions, solo
 * cambia la dirección. La clave sigue haciendo falta como cabecera
 * (Authorization: Bearer ...) aunque el servidor no la valide de verdad — basta con
 * poner cualquier texto no vacío.
 */
const BASE_URL_GROQ = 'https://api.groq.com/openai/v1';
const BASE_URL = (process.env.OPENAI_BASE_URL ?? BASE_URL_GROQ).replace(/\/+$/, '');
const ENDPOINT = `${BASE_URL}/chat/completions`;
const ENDPOINT_RESPUESTAS = `${BASE_URL}/responses`;

/** Solo la API real de OpenAI expone /responses con buscador integrado — Groq (el
 * proveedor por defecto) y cualquier servidor local resuelven el buscador de otra
 * forma (ver completarConBusqueda) o no lo tienen. */
const ES_OPENAI_REAL = BASE_URL === 'https://api.openai.com/v1';
const ES_GROQ = BASE_URL === BASE_URL_GROQ;

/** Barato y suficiente para resumir y extraer tareas. Ver README para los costes.
 * Con un servidor en local, aquí va el nombre del modelo que sirva ese servidor
 * (p. ej. "llama3.1" en Ollama), no un modelo de OpenAI ni de Groq. */
export const MODELO = process.env.OPENAI_MODEL ?? (ES_GROQ ? 'openai/gpt-oss-120b' : 'gpt-4o-mini');

/** Modelo para el chat del asistente (completarConBusqueda), que puede ser distinto
 * del de resumir/extraer tareas: en OpenAI da igual (ambos soportan el buscador),
 * pero en Groq hace falta separarlo — `groq/compound` trae el buscador integrado
 * pero no es un modelo ideal para forzar JSON, así que resumen/tareas siguen en
 * MODELO y solo el chat usa este. Si no se define, usa el mismo que el resto. */
export const MODELO_ASISTENTE =
  process.env.OPENAI_MODEL_ASISTENTE ?? (ES_GROQ ? 'groq/compound' : MODELO);

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
  /** Solo para llamadas que ya han consumido parte del `maxDuration` de su ruta
   * (el plan B de `completarConBusqueda`) — recorta la espera para no superarlo. */
  timeoutMs?: number;
  /** Por defecto MODELO — completarConBusqueda lo pisa con MODELO_ASISTENTE cuando
   * el proveedor (p. ej. Groq) resuelve el buscador dentro del propio modelo. */
  modelo?: string;
};

export async function completar({
  mensajes,
  json = false,
  temperatura = 0.3,
  maxTokens = 1200,
  timeoutMs = 90_000,
  modelo = MODELO,
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
        model: modelo,
        messages: mensajes,
        temperature: temperatura,
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      }),
      // Sin esto una petición colgada bloquea el route handler hasta el timeout
      // de la plataforma, que es mucho más largo que la paciencia del usuario.
      // Más margen que con la API de OpenAI porque un modelo en local (sobre todo
      // sin GPU) puede tardar bastante más en generar la misma respuesta.
      signal: AbortSignal.timeout(timeoutMs),
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
 * contexto que se le ha dado.
 *
 * Dos proveedores lo dan sin montar nada aparte:
 * - Groq (proveedor por defecto) con el modelo "compound": el buscador va integrado
 *   en el propio modelo sobre el endpoint normal de chat completions, sin parámetro
 *   de herramienta ni endpoint distinto.
 * - OpenAI real: usa /responses con la herramienta `web_search_preview` (no existe
 *   en /chat/completions). La forma de la respuesta es distinta a la de chat
 *   completions: un array `output` con los pasos que ha dado el modelo (llamadas al
 *   buscador, mensaje final...), así que hay que quedarse solo con el texto.
 *
 * Fuera de OpenAI real (Groq, servidor local...) esta función no toca /responses y
 * usa `completar` tal cual, pero con MODELO_ASISTENTE en vez de MODELO (con Groq,
 * `compound` no es el modelo que se quiere para resumir notas o forzar JSON en la
 * extracción de tareas).
 *
 * Si la llamada a /responses falla por lo que sea (cuenta sin el buscador
 * habilitado, error puntual del proveedor...), no se rompe el asistente entero: se
 * reintenta sin buscador contra /chat/completions, que es más compatible.
 */
export async function completarConBusqueda({
  mensajes,
  temperatura = 0.4,
  maxTokens = 1200,
}: Omit<Opciones, 'json' | 'modelo'>): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ErrorIA('La IA no está configurada en este despliegue.', 503);
  }

  if (!ES_OPENAI_REAL) {
    return completar({ mensajes, temperatura, maxTokens, modelo: MODELO_ASISTENTE });
  }

  try {
    return await buscarConResponsesApi({ mensajes, apiKey, temperatura, maxTokens });
  } catch (fallo) {
    // 503 es "no hay clave" (ya se ha comprobado arriba, no puede pasar) — cualquier
    // otro fallo del buscador cae a la llamada de siempre, sin buscador, en vez de
    // dejar al usuario sin respuesta por una herramienta que no es imprescindible.
    // timeoutMs corto: el intento con buscador ya se ha comido buena parte de los
    // 60s de la ruta, y este plan B tiene que caber en lo que queda.
    if (fallo instanceof ErrorIA && fallo.estado === 503) throw fallo;
    return completar({
      mensajes,
      temperatura,
      maxTokens,
      timeoutMs: 15_000,
      modelo: MODELO_ASISTENTE,
    });
  }
}

async function buscarConResponsesApi({
  mensajes,
  apiKey,
  temperatura,
  maxTokens,
}: {
  mensajes: Mensaje[];
  apiKey: string;
  temperatura: number;
  maxTokens: number;
}): Promise<string> {
  let respuesta: Response;
  try {
    respuesta = await fetch(ENDPOINT_RESPUESTAS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODELO_ASISTENTE,
        input: mensajes,
        tools: [{ type: 'web_search_preview' }],
        temperature: temperatura,
        max_output_tokens: maxTokens,
      }),
      // Deja margen dentro del maxDuration=60 de la ruta para el plan B (completar
      // sin buscador) si esto falla o se pasa de tiempo.
      signal: AbortSignal.timeout(42_000),
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
