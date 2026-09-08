import { site } from '@/content/site'

/**
 * Envío de un lead, con la misma cadena de respaldo que usa el formulario
 * de contacto: endpoint externo si está configurado → nuestro propio
 * `/api/lead` → `mailto:` con todo relleno.
 *
 * La regla que ordena todo esto: un lead no puede perderse en silencio.
 * Si el backend no está configurado (`api/lead.ts` responde 501 a
 * propósito cuando falta `RESEND_API_KEY`) o falla, se abre el cliente de
 * correo en vez de mostrar un error y dejar al visitante sin salida.
 *
 * `ContactForm.tsx` mantiene su propia copia de esta lógica a propósito:
 * su circuito con Resend está en producción y funcionando, y no compensa
 * tocarlo para deduplicar. Este helper nace para los formularios nuevos.
 */

const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined

export type EstadoEnvio = 'sent' | 'mail' | 'error'

export async function enviarLead({
  payload,
  asunto,
  cuerpo,
}: {
  /** Se envía tal cual como JSON. Debe incluir nombre, email, mensaje y score. */
  payload: Record<string, unknown>
  /** Asunto del correo, sólo para el respaldo por `mailto:`. */
  asunto: string
  /** Cuerpo en texto plano, sólo para el respaldo por `mailto:`. */
  cuerpo: string
}): Promise<EstadoEnvio> {
  if (ENDPOINT) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      // Con endpoint externo no hay respaldo: si falla, se avisa del error.
      return res.ok ? 'sent' : 'error'
    } catch {
      return 'error'
    }
  }

  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) return 'sent'
  } catch {
    // sigue al mailto
  }

  window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
    asunto,
  )}&body=${encodeURIComponent(cuerpo)}`
  return 'mail'
}
