import { env } from './env.js'

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

// Cliente mínimo para Ollama (https://ollama.com), que sirve modelos de
// lenguaje corriendo en tu propia máquina: cero coste por token porque no
// hay API de pago de por medio, solo tu CPU/GPU. Requiere tener Ollama
// arrancado (`ollama serve`, o la app de escritorio) y el modelo descargado
// (`ollama pull llama3.2`).
export async function chatWithLocalModel(messages: ChatMessage[]): Promise<string> {
  const res = await fetch(`${env.ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.ollamaModel,
      messages,
      stream: false,
      options: { temperature: 0.6 },
    }),
  })

  if (!res.ok) {
    throw new Error(
      `Ollama respondió ${res.status}. ¿Está arrancado (\`ollama serve\`) y descargado el modelo ` +
        `"${env.ollamaModel}" (\`ollama pull ${env.ollamaModel}\`)?`,
    )
  }

  const data = (await res.json()) as { message?: { content?: string } }
  return data.message?.content?.trim() ?? ''
}
