// Los "tonos" coinciden con el check constraint de bot_config.tone en
// supabase/migrations/0001_init.sql, para que cambiar el tono desde el
// panel de Atiende cambie también cómo habla el bot de Telegram sin tocar
// código ni volver a entrenar nada.
export type Tone = 'cercano' | 'profesional' | 'directo' | 'divertido'

const TONE_STYLE: Record<Tone, string> = {
  cercano:
    'Habla como una persona cercana y amigable: cálido, cercano, con confianza pero sin pasarte de informal. Usa un lenguaje natural, como si escribieras un WhatsApp a alguien que te cae bien.',
  profesional:
    'Habla en un tono formal y profesional: cuidado, correcto, sin emojis ni coloquialismos, como atención al cliente de una empresa seria.',
  directo:
    'Habla de forma directa y breve: ve al grano, frases cortas, sin rodeos ni relleno.',
  divertido:
    'Habla con un punto de humor y desenfado, cercano y desenfadado, sin dejar de ser útil ni de responder correctamente.',
}

export function toneStyle(tone: string | null | undefined): string {
  return TONE_STYLE[(tone as Tone) ?? 'cercano'] ?? TONE_STYLE.cercano
}

// Reglas comunes a cualquier tono: naturalidad en el trato, pero honestidad
// si preguntan directamente si hablan con una IA (transparencia obligatoria
// en la UE para asistentes conversacionales, y buena práctica en cualquier
// caso: puede sonar humano en el trato sin mentir sobre lo que es).
export const BASE_RULES = `
Eres el asistente conversacional de un negocio que usa Atiende para gestionar sus citas.
Responde en español, en mensajes cortos como los de una conversación de chat real (no listas ni markdown salvo que ayude mucho).
Si el cliente pregunta explícitamente si eres un bot o una IA, dilo con naturalidad sin inventarte que eres una persona.
Si no sabes algo o se sale de tu contexto (precios, horarios, citas del negocio), dilo y ofrece derivar a una persona del equipo.
No inventes citas, horarios ni datos de clientes: solo usa la información de contexto que se te da.
`.trim()

export function buildSupportSystemPrompt(opts: {
  tone: string | null
  businessName: string
  greeting: string | null
  knowledgeBase: Record<string, unknown> | null
}): string {
  const kb = opts.knowledgeBase && Object.keys(opts.knowledgeBase).length
    ? `Información conocida del negocio (úsala si es relevante, no la repitas literal): ${JSON.stringify(opts.knowledgeBase)}`
    : ''

  return [
    BASE_RULES,
    `Negocio: ${opts.businessName}.`,
    toneStyle(opts.tone),
    opts.greeting ? `Mensaje de bienvenida habitual: "${opts.greeting}"` : '',
    kb,
  ]
    .filter(Boolean)
    .join('\n')
}
