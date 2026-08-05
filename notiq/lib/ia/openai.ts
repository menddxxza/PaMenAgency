/**
 * Cliente mínimo de OpenAI sobre fetch.
 *
 * No se instala el SDK a propósito: Notiq hace dos llamadas (chat completions con y
 * sin JSON forzado) y el SDK son ~4 MB en el bundle del servidor que hay que mantener
 * al día. Si algún día hacen falta streaming de audio o assistants, se cambia.
 */

const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

/** Barato y suficiente para resumir y extraer tareas. Ver README para los costes. */
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
      signal: AbortSignal.timeout(45_000),
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

/** Igual que `completar`, pero devolviendo JSON ya parseado. */
export async function completarJson<T>(opciones: Omit<Opciones, 'json'>): Promise<T> {
  const bruto = await completar({ ...opciones, json: true });
  try {
    return JSON.parse(bruto) as T;
  } catch {
    throw new ErrorIA('La IA ha devuelto un JSON que no se puede leer.');
  }
}
