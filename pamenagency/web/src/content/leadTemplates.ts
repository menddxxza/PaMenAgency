/**
 * Plantillas de mensajes para el ciclo de vida de un lead, en el mismo tono
 * que el resto de la web: profesional, directo, sin frases de marketing
 * vacías. Son solo texto de referencia para copiar a mano — nada de este
 * archivo se envía automáticamente. `api/lead.ts` únicamente avisa por
 * email de un lead nuevo; responder es cosa de una persona.
 */

export interface PlantillaMensaje {
  asunto?: string
  cuerpo: string
}

/**
 * Secuencia de seguimiento tras el primer contacto. Pensada para email o
 * WhatsApp — el texto es el mismo en ambos, solo cambia el medio.
 */
export const seguimiento = {
  primerContacto: {
    asunto: 'Sobre tu consulta a PamenAgency',
    cuerpo: `Hola [Nombre], soy [Tu Nombre], de PamenAgency.

Vi tu mensaje sobre [necesidad] y quería contactarte directamente antes de que se enfríe. ¿Tienes un momento esta semana para comentarlo?`,
  },
  recordatorio1: {
    asunto: 'Seguimos en contacto, [Nombre]',
    cuerpo: `Hola [Nombre], sigo en contacto contigo por si ha cambiado algo desde tu último mensaje o te ha surgido alguna duda nueva.

Si quieres retomarlo, aquí estamos.`,
  },
  recordatorio2: {
    asunto: 'Último mensaje por nuestra parte, [Nombre]',
    cuerpo: `Hola [Nombre], último mensaje por mi parte — no quiero insistir más de la cuenta. Si en algún momento te viene bien retomarlo, nos tienes aquí.

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
    asunto: 'Novedades en PamenAgency para [Empresa]',
    cuerpo: `Estimado/a [Nombre],

Hace tiempo que no colaboramos y nos gustaría presentarle nuestras soluciones actualizadas, que pueden incrementar la visibilidad de su negocio.

¿Podríamos agendar una llamada de 15 minutos esta semana?

Saludos cordiales,
[Tu Nombre]
PamenAgency`,
  },
  sms: {
    cuerpo: `Hola [Nombre], es [Tu Nombre] de PamenAgency. ¿Tiene 15 min para hablar sobre nuevas oportunidades de visibilidad? Responda 1 para confirmar.`,
  },
} satisfies Record<string, PlantillaMensaje>
