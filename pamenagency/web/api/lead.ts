import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Recibe el formulario de contacto ya puntuado (ver `leadScore` en
 * ContactForm.tsx) y decide qué hacer con el lead:
 *
 * - Puntuación >= 4 ("caliente"): se avisa a ventas por email de inmediato.
 *   Ese aviso es lo único que de verdad no puede fallar en silencio — es la
 *   razón por la que existe esta función.
 * - Puntuación < 4 ("frío"): no se molesta a ventas; solo se envía la
 *   respuesta automática de la banda fría.
 * - En ambos casos se intenta además enviar una respuesta automática al
 *   propio lead (plantillas en src/content/leadTemplates.ts) — esto es
 *   "mejor si sale", nunca bloquea la respuesta.
 *
 * Variables de entorno (Vercel → Settings → Environment Variables):
 * - RESEND_API_KEY: clave de https://resend.com/api-keys. Sin ella, esta
 *   función responde con `501` a propósito, para que ContactForm haga su
 *   propio fallback a mailto: — así el lead nunca se pierde en silencio.
 * - RESEND_FROM (opcional): remitente, p. ej. "PamenAgency <hola@pamenagency.com>".
 *   IMPORTANTE: con el dominio de pruebas de Resend (onboarding@resend.dev)
 *   solo se puede enviar a la propia cuenta de Resend, no a un lead
 *   cualquiera. Para que los correos lleguen de verdad a los leads hace
 *   falta verificar un dominio propio en Resend y apuntar esta variable ahí.
 * - LEADS_EMAIL (opcional): a quién avisar de un lead nuevo. Por defecto,
 *   el correo de contacto general de la agencia.
 * - ZAPIER_WEBHOOK_URL (opcional): si se rellena, cada lead también se
 *   reenvía ahí en bruto (best-effort) — es el punto de enganche para la
 *   herramienta de automatización (Zapier, Make/Integromat, HubSpot…) que
 *   se elija; configurarla de verdad requiere la cuenta correspondiente,
 *   que esta función no tiene ni puede crear.
 *
 * No pasa por Vite, así que no puede usar el alias `@/` del frontend — de
 * ahí la ruta relativa a src/content.
 */

import {
  aplicarPlantilla,
  REMITENTE_POR_DEFECTO,
  respuestaInicial,
} from '../src/content/leadTemplates'

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const DEFAULT_FROM = 'PamenAgency <onboarding@resend.dev>'
const DEFAULT_LEADS_EMAIL = 'soporte.atiende@gmail.com'
const URL_DIAGNOSTICO = 'https://pamenagency.com/diagnostico'
const URL_GUIA = 'https://pamenagency.com/conocimiento/como-elegir-tu-primera-automatizacion'

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

async function sendEmail(apiKey: string, from: string, to: string, subject: string, text: string) {
  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from, to, subject, text }),
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
    // justo lo que debe pasar si no hay forma de enviar el aviso a ventas.
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

  // El aviso interno es lo único que no puede fallar en silencio: si esto no
  // sale, respondemos no-ok para que el formulario recurra a mailto y la
  // persona vea el lead de todos modos en su propio cliente de correo.
  const asuntoInterno =
    routed === 'ventas'
      ? `Lead caliente (${lead.score}/5) — ${lead.nombre}`
      : `Nuevo lead (${lead.score}/5) — ${lead.nombre}`

  let avisoEnviado = false
  try {
    avisoEnviado = await sendEmail(apiKey, from, leadsEmail, asuntoInterno, detalle)
  } catch {
    avisoEnviado = false
  }

  if (!avisoEnviado) {
    res.status(502).json({ error: 'send_failed' })
    return
  }

  // Respuesta automática al propio lead — mejor si sale, pero no crítica.
  let autoReplySent = false
  try {
    const plantilla = routed === 'ventas' ? respuestaInicial.caliente : respuestaInicial.fria
    const datos = {
      nombre: lead.nombre,
      remitente: REMITENTE_POR_DEFECTO,
      urlDiagnostico: URL_DIAGNOSTICO,
      urlGuia: URL_GUIA,
    }
    autoReplySent = await sendEmail(
      apiKey,
      from,
      lead.email,
      aplicarPlantilla(plantilla.asunto ?? '', datos),
      aplicarPlantilla(plantilla.cuerpo, datos),
    )
  } catch {
    autoReplySent = false
  }

  // Reenvío best-effort a la herramienta de automatización, si se ha
  // configurado — nunca condiciona la respuesta al formulario.
  const zapierUrl = process.env.ZAPIER_WEBHOOK_URL
  if (zapierUrl) {
    fetch(zapierUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lead, routed }),
    }).catch(() => {})
  }

  res.status(200).json({ ok: true, routed, autoReplySent })
}
