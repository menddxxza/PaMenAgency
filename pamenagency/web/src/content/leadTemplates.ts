/**
 * Plantillas de mensajes para el ciclo de vida de un lead, en el mismo tono
 * que el resto de la web: profesional, directo, sin frases de marketing
 * vacías. Sirven para tres cosas distintas:
 *
 * 1. Respuesta automática inmediata según la puntuación del formulario de
 *    contacto (la envía `api/lead.ts` de verdad, por email, si hay
 *    `RESEND_API_KEY` configurada).
 * 2. Plantillas de seguimiento (recordatorio 1, recordatorio 2, cierre) para
 *    que una persona del equipo las use a mano o se carguen en la
 *    herramienta de automatización que se elija (Zapier, Integromat,
 *    HubSpot…) — este archivo no las envía por sí solo, ver el aviso en
 *    api/lead.ts sobre qué parte del ciclo queda fuera del código.
 * 3. Plantillas de reactivación para contactos antiguos.
 *
 * `{{marcador}}` se sustituye con aplicarPlantilla(). Los campos que no
 * llegan (p. ej. la empresa, si el lead no la rellenó) se sustituyen por
 * cadena vacía, nunca por "undefined".
 */

export interface PlantillaMensaje {
  asunto?: string
  cuerpo: string
}

export function aplicarPlantilla(texto: string, datos: Record<string, string | undefined>): string {
  return texto.replace(/\{\{(\w+)\}\}/g, (_, clave: string) => datos[clave]?.trim() || '')
}

/** Remitente por defecto cuando nadie de PamenAgency ha personalizado el campo. */
export const REMITENTE_POR_DEFECTO = 'El equipo de PamenAgency'

/**
 * Primer contacto automático justo después de enviar el formulario, según la
 * puntuación calculada en ContactForm (ver `leadScore`). No hay una plantilla
 * por cada puntuación exacta: se agrupan en dos bandas, que es lo que de
 * verdad se puede automatizar sin una persona interviniendo.
 */
export const respuestaInicial = {
  /** Puntuación >= 4: se avisa también a ventas (ver api/lead.ts). */
  caliente: {
    asunto: 'Gracias por escribirnos, {{nombre}}',
    cuerpo: `Hola {{nombre}},

Gracias por tu interés. Nos encantaría conversar más sobre tu caso — alguien del equipo va a revisar lo que nos has contado y se pone en contacto contigo en menos de un día laborable.

¿Cuándo te viene bien para una llamada rápida? Puedes responder directamente a este correo con un par de horarios y lo cuadramos.

Un saludo,
{{remitente}}`,
  },
  /** Puntuación < 4: solo respuesta automática, sin aviso a ventas. */
  fria: {
    asunto: 'Hemos recibido tu mensaje, {{nombre}}',
    cuerpo: `Hola {{nombre}},

Gracias por tu mensaje. Estamos revisando tu solicitud y te responderemos pronto.

Mientras tanto, te dejamos dos recursos gratuitos que suelen ayudar en esta fase, sin compromiso:
- El diagnóstico de dos minutos: {{urlDiagnostico}}
- La guía "Cómo elegir tu primera automatización": {{urlGuia}}

Si en cualquier momento quieres hablar con alguien del equipo, responde a este correo.

Un saludo,
{{remitente}}`,
  },
} satisfies Record<string, PlantillaMensaje>

/**
 * Secuencia de seguimiento tras el primer contacto. Pensada para 3-4 canales
 * (email/WhatsApp), pero el texto es el mismo en ambos — solo cambia el
 * medio, no el mensaje.
 */
export const seguimiento = {
  primerContacto: {
    asunto: 'Sobre tu consulta a PamenAgency',
    cuerpo: `Hola {{nombre}}, soy {{remitente}}, de PamenAgency.

Vi tu mensaje sobre {{necesidad}} y quería contactarte directamente antes de que se enfríe. ¿Tienes un momento esta semana para comentarlo?`,
  },
  recordatorio1: {
    asunto: 'Seguimos en contacto, {{nombre}}',
    cuerpo: `Hola {{nombre}}, sigo en contacto contigo por si ha cambiado algo desde tu último mensaje o te ha surgido alguna duda nueva.

Si quieres retomarlo, aquí estamos.`,
  },
  recordatorio2: {
    asunto: 'Último mensaje por nuestra parte, {{nombre}}',
    cuerpo: `Hola {{nombre}}, último mensaje por mi parte — no quiero insistir más de la cuenta. Si en algún momento te viene bien retomarlo, nos tienes aquí.

Gracias por tu tiempo.`,
  },
  cierre: {
    asunto: 'Gracias por tu tiempo',
    cuerpo: `Gracias por tu tiempo y por haber considerado a PamenAgency. Cerramos este contacto por ahora, pero si en el futuro vuelve a tener sentido, encantados de retomarlo.`,
  },
} satisfies Record<string, PlantillaMensaje>

/** Reactivación de contactos antiguos o leads recuperables. */
export const reactivacion = {
  email: {
    asunto: 'Novedades en PamenAgency para {{empresa}}',
    cuerpo: `Estimado/a {{nombre}},

Hace tiempo que no colaboramos y nos gustaría presentarle nuestras soluciones actualizadas, que pueden incrementar la visibilidad de su negocio.

¿Podríamos agendar una llamada de 15 minutos esta semana?

Saludos cordiales,
{{remitente}}
PamenAgency`,
  },
  sms: {
    cuerpo: `Hola {{nombre}}, es {{remitente}} de PamenAgency. ¿Tiene 15 min para hablar sobre nuevas oportunidades de visibilidad? Responda 1 para confirmar.`,
  },
} satisfies Record<string, PlantillaMensaje>
