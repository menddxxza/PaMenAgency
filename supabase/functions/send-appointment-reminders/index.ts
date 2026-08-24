// Edge Function programada que envía recordatorios automáticos de citas
// próximas por WhatsApp. Cada negocio configura su antelación en
// bot_config.reminder_hours_before (panel → Configuración).
//
// Cada cita se recuerda una sola vez: en cuanto el envío a n8n responde OK,
// se marca `reminder_sent_at` (RPC mark_reminder_sent) para no recordarla de
// nuevo en la siguiente pasada.
//
// Prográmala desde Database → Cron Jobs del dashboard de Supabase (p.ej.
// cada 15 min) apuntando aquí con la service_role key. No hace falta pasar
// parámetros: recorre las citas pendientes de todos los negocios.
//
// POST /functions/v1/send-appointment-reminders
// Headers: Authorization: Bearer <service_role_key>

import { createClient } from 'jsr:@supabase/supabase-js@2'

const N8N_OUTBOUND_WEBHOOK_URL = Deno.env.get('N8N_OUTBOUND_WEBHOOK_URL') ?? ''

interface DueReminder {
  appointment_id: string
  business_id: string
  client_phone: string
  client_name: string | null
  service_name: string | null
  starts_at: string
}

function reminderMessage(row: DueReminder): string {
  const when = new Date(row.starts_at).toLocaleString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
  const saludo = row.client_name ? `Hola ${row.client_name}` : 'Hola'
  const servicio = row.service_name ? ` de ${row.service_name}` : ''
  return `${saludo}, te recordamos tu cita${servicio} el ${when}. Responde CONFIRMAR o CANCELAR si necesitas cambiarla.`
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }
  if (!N8N_OUTBOUND_WEBHOOK_URL) {
    return new Response(JSON.stringify({ error: 'N8N_OUTBOUND_WEBHOOK_URL no está configurada' }), { status: 500 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const { data: due, error } = await supabase.rpc('due_appointment_reminders')
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  let sent = 0
  let failed = 0

  for (const row of (due ?? []) as DueReminder[]) {
    const content = reminderMessage(row)
    try {
      const res = await fetch(N8N_OUTBOUND_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: row.business_id,
          phone: row.client_phone,
          content,
          reason: 'appointment_reminder',
        }),
      })
      if (!res.ok) throw new Error(`n8n respondió ${res.status}`)

      await supabase.rpc('handle_inbound_message', {
        p_business_id: row.business_id,
        p_phone: row.client_phone,
        p_content: content,
        p_sender: 'bot',
      })
      await supabase.rpc('mark_reminder_sent', { p_appointment_id: row.appointment_id })
      sent++
    } catch {
      failed++
    }
  }

  return new Response(JSON.stringify({ sent, failed, total: (due ?? []).length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
