/**
 * Plantillas de mensajes para el ciclo de vida de un lead, en el mismo tono
 * que el resto de la web: profesional, directo, sin frases de marketing
 * vacías y sin prometer nunca un resultado garantizado. Son solo texto de
 * referencia para copiar a mano — nada de este archivo se envía
 * automáticamente. `api/lead.ts` únicamente avisa por email de un lead
 * nuevo; responder es cosa de una persona.
 */

export interface PlantillaMensaje {
  asunto?: string
  cuerpo: string
}

/**
 * Secuencia de seguimiento tras el primer contacto, con una plantilla por
 * canal en cada fase: el email admite algo más de formalidad y lleva
 * asunto; WhatsApp va directo al grano y sin asunto. El CTA de cada fase es
 * siempre concreto (proponer un hueco, no "cuando quieras"), salvo en el
 * cierre, donde forzar un CTA sería justo la insistencia que se quiere
 * evitar.
 */
export const seguimiento = {
  email: {
    primerContacto: {
      asunto: 'Sobre tu consulta a PamenAgency',
      cuerpo: `Hola [Nombre], soy [Tu Nombre] de PamenAgency.

Vi tu mensaje sobre [necesidad] y quería escribirte directamente antes de que se enfríe.

¿Tienes 15 minutos esta semana para comentarlo? Dime qué día te viene mejor y te mando un enlace para agendar la llamada.

Un saludo,
[Tu Nombre]`,
    },
    recordatorio1: {
      asunto: 'Seguimos en contacto, [Nombre]',
      cuerpo: `Hola [Nombre], sigo en contacto por si ha cambiado algo desde tu último mensaje o te ha surgido alguna duda nueva.

Si te viene bien, dime un par de horarios esta semana y lo cuadramos.

Un saludo,
[Tu Nombre]`,
    },
    recordatorio2: {
      asunto: 'Último mensaje por nuestra parte, [Nombre]',
      cuerpo: `Hola [Nombre], este es el último mensaje que te envío por este asunto — no quiero insistir más de la cuenta.

Si en algún momento te viene bien retomarlo, responde a este correo y seguimos donde lo dejamos.

Gracias por tu tiempo,
[Tu Nombre]`,
    },
    cierre: {
      asunto: 'Gracias por tu tiempo',
      cuerpo: `Hola [Nombre],

Gracias por tu tiempo y por haber considerado a PamenAgency. Cierro este contacto por ahora, pero si en el futuro vuelve a tener sentido, aquí estaré.

Un saludo,
[Tu Nombre]`,
    },
  },
  whatsapp: {
    primerContacto: {
      cuerpo: `Hola [Nombre], soy [Tu Nombre] de PamenAgency. Vi tu mensaje sobre [necesidad] y quería escribirte directamente. ¿Tienes 15 min esta semana para comentarlo? Dime qué día te viene mejor.`,
    },
    recordatorio1: {
      cuerpo: `Hola [Nombre], sigo por aquí por si te ha surgido alguna duda o ha cambiado algo desde tu último mensaje. Si quieres retomarlo, dime un hueco esta semana.`,
    },
    recordatorio2: {
      cuerpo: `Hola [Nombre], último mensaje por mi parte — no quiero insistir más de la cuenta. Si en algún momento te viene bien, aquí me tienes.`,
    },
    cierre: {
      cuerpo: `Gracias por tu tiempo, [Nombre]. Cierro este contacto por ahora; si en el futuro vuelve a tener sentido, escríbeme cuando quieras.`,
    },
  },
} satisfies Record<'email' | 'whatsapp', Record<string, PlantillaMensaje>>

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
