import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Recibe el formulario de contacto ya puntuado (ver `leadScore` en
 * ContactForm.tsx) y avisa por email de un lead nuevo — nada más. No envía
 * ninguna respuesta automática al lead ni a ningún sitio: solo notifica, y
 * la persona responde a mano desde su propio correo.
 *
 * Variables de entorno (Vercel → Settings → Environment Variables):
 * - RESEND_API_KEY: clave de https://resend.com/api-keys. Sin ella, esta
 *   función responde con `501` a propósito, para que ContactForm haga su
 *   propio fallback a mailto: — así el lead nunca se pierde en silencio.
 * - RESEND_FROM (opcional): remitente, p. ej. "PamenAgency <hola@pamenagency.com>".
 *   IMPORTANTE: con el dominio de pruebas de Resend (onboarding@resend.dev)
 *   solo se puede enviar a la propia cuenta de Resend. Para que el aviso
 *   llegue de verdad, verifica un dominio propio en Resend y apunta esta
 *   variable ahí.
 * - LEADS_EMAIL (opcional): a qué email se avisa de cada lead nuevo. Por
 *   defecto, el correo de contacto general de la agencia.
 *
 * No pasa por Vite, así que no puede usar el alias `@/` del frontend.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const DEFAULT_FROM = 'PamenAgency <onboarding@resend.dev>'
const DEFAULT_LEADS_EMAIL = 'soporte.atiende@gmail.com'

const ALLOWED_ORIGINS = ['https://pamenagency.com', 'https://www.pamenagency.com']

function isAllowedOrigin(origin: string | undefined): origin is string {
  if (!origin) return false
  if (ALLOWED_ORIGINS.includes(origin)) return true
  if (/^https:\/\/pamenagency[a-z0-9-]*\.vercel\.app$/.test(origin)) return true
  if (/^http:\/\/localhost:\d+$/.test(origin)) return true
  return false
}

interface LeadPayload {
  nombre: string
  empresa?: string
  email: string
  telefono?: string
  sector?: string
  necesidad?: string
  presupuesto?: string
  urgencia?: string
  mensaje: string
  score: number
}

function isValidLead(body: unknown): body is LeadPayload {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.nombre === 'string' &&
    b.nombre.trim().length >= 2 &&
    typeof b.email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(b.email.trim()) &&
    typeof b.mensaje === 'string' &&
    b.mensaje.trim().length >= 10 &&
    typeof b.score === 'number' &&
    Number.isFinite(b.score)
  )
}

async function sendEmail(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  text: string,
  replyTo?: string,
) {
  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from, to, subject, text, reply_to: replyTo }),
  })
  return res.ok
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin as string | undefined
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // A propósito, no es un 200 con "ok" falso: ContactForm interpreta
    // cualquier respuesta no-ok como "usa el mailto de siempre", que es
    // justo lo que debe pasar si no hay forma de enviar el aviso.
    res.status(501).json({ error: 'not_configured' })
    return
  }

  if (!isValidLead(req.body)) {
    res.status(400).json({ error: 'invalid_lead' })
    return
  }

  const lead = req.body as LeadPayload
  const from = process.env.RESEND_FROM || DEFAULT_FROM
  const leadsEmail = process.env.LEADS_EMAIL || DEFAULT_LEADS_EMAIL
  const routed: 'ventas' | 'automatico' = lead.score >= 4 ? 'ventas' : 'automatico'

  const detalle = [
    `Puntuación: ${lead.score} (${routed === 'ventas' ? 'asignado a ventas' : 'seguimiento automático'})`,
    `Nombre: ${lead.nombre}`,
    lead.empresa && `Empresa: ${lead.empresa}`,
    `Email: ${lead.email}`,
    lead.telefono && `Teléfono: ${lead.telefono}`,
    lead.sector && `Sector: ${lead.sector}`,
    lead.necesidad && `Necesidad: ${lead.necesidad}`,
    lead.presupuesto && `Presupuesto: ${lead.presupuesto}`,
    lead.urgencia && `Urgencia (1-5): ${lead.urgencia}`,
    '',
    lead.mensaje,
  ]
    .filter(Boolean)
    .join('\n')

  const asunto =
    routed === 'ventas'
      ? `Lead caliente (${lead.score}/5) — ${lead.nombre}`
      : `Nuevo lead (${lead.score}/5) — ${lead.nombre}`

  let avisoEnviado = false
  try {
    // reply_to al propio lead: al pulsar "responder" en el aviso, se
    // contesta directamente a la persona, no al remitente automático.
    avisoEnviado = await sendEmail(apiKey, from, leadsEmail, asunto, detalle, lead.email)
  } catch {
    avisoEnviado = false
  }

  if (!avisoEnviado) {
    res.status(502).json({ error: 'send_failed' })
    return
  }

  res.status(200).json({ ok: true, routed })
}
