// Punto de integración con el backend de n8n.
//
// Dirección WhatsApp -> app: n8n recibe el webhook de Meta Cloud API, procesa
// el mensaje con el bot/IA, y llama al RPC `handle_inbound_message` de
// Supabase (supabase/migrations/0001_init.sql) usando la service_role key
// para dejar el mensaje en `messages` de forma atómica. El panel se entera en
// vivo vía Realtime (ver src/hooks/useConversations.ts y useMessages.ts) —
// esta app no necesita llamar a n8n para leer mensajes entrantes.
//
// Dirección app -> n8n: cuando un agente responde manualmente desde el panel,
// o cuando se necesita disparar una acción del bot (p.ej. reenviar un
// recordatorio de cita), esta app hace un POST al webhook de n8n indicado en
// N8N_OUTBOUND_WEBHOOK_URL. n8n es responsable de enviar el mensaje por la
// API de WhatsApp Business.

const N8N_OUTBOUND_WEBHOOK_URL = import.meta.env.VITE_N8N_OUTBOUND_WEBHOOK_URL as string | undefined

export interface SendWhatsappMessagePayload {
  businessId: string
  conversationId: string
  phone: string
  content: string
}

export async function sendWhatsappMessageViaN8n(payload: SendWhatsappMessagePayload): Promise<void> {
  if (!N8N_OUTBOUND_WEBHOOK_URL) {
    throw new Error('VITE_N8N_OUTBOUND_WEBHOOK_URL no está configurada')
  }

  const response = await fetch(N8N_OUTBOUND_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`n8n webhook respondió ${response.status}`)
  }
}
