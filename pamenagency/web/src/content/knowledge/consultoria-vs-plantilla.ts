import type { KnowledgeDoc } from './types'

export const consultoriaVsPlantilla: KnowledgeDoc = {
  slug: 'consultoria-de-ia-vs-contratar-en-plantilla',
  title: 'Consultoría de IA vs contratar en plantilla',
  summary:
    'Traer a alguien externo o incorporar a alguien en el equipo no son opciones equivalentes: resuelven cosas distintas. Esta guía compara ambas con honestidad, incluyendo cuándo NO conviene la opción que ofrecemos nosotros.',
  category: 'Decisión',
  level: 'Iniciación',
  updated: '2026-08-19',
  intro: [
    {
      type: 'p',
      text: 'Es una pregunta razonable, y quien la responda siempre a favor de su propio modelo de negocio no está siendo del todo honesto. Una consultoría externa y una persona en plantilla resuelven problemas distintos, y en muchos negocios la respuesta correcta no es «una u otra», sino «una y después la otra».',
    },
    {
      type: 'p',
      text: 'Esta guía compara ambas opciones sin dar por hecho que la externa es siempre la mejor, aunque sea justamente lo que hacemos nosotros.',
    },
  ],
  chapters: [
    {
      id: 'que-resuelve-cada-una',
      title: '1. Qué resuelve bien cada opción',
      blocks: [
        {
          type: 'h3',
          text: 'Una consultoría externa resuelve bien',
        },
        {
          type: 'ul',
          items: [
            'Proyectos con principio y fin claros: diagnosticar, construir algo concreto, dejarlo funcionando.',
            'La falta de criterio experto puntual: saber qué es viable y qué no lo es, sin tener que aprenderlo por prueba y error.',
            'Picos de trabajo que no justifican una contratación permanente.',
            'Una mirada externa, sin las asunciones internas de «aquí siempre se ha hecho así».',
          ],
        },
        {
          type: 'h3',
          text: 'Una persona en plantilla resuelve bien',
        },
        {
          type: 'ul',
          items: [
            'La necesidad continua: alguien que vive el día a día del negocio y ajusta sobre la marcha.',
            'El conocimiento acumulado dentro de la empresa, que no se pierde cuando termina un contrato.',
            'La disponibilidad inmediata para lo que surja, sin depender de la agenda de un tercero.',
            'La integración cultural: entiende cómo se decide, no sólo cómo se ejecuta.',
          ],
        },
        {
          type: 'callout',
          label: 'La pregunta que de verdad importa',
          text: '¿Es esto un proyecto (con final) o una función (que continúa)? La respuesta suele decidir por sí sola entre las dos opciones.',
        },
      ],
    },
    {
      id: 'coste-real',
      title: '2. El coste real, no sólo el precio',
      blocks: [
        {
          type: 'p',
          text: 'Comparar el precio de un proyecto con un sueldo bruto es un error habitual, porque un sueldo no es el coste completo de contratar a alguien.',
        },
        {
          type: 'ul',
          items: [
            'Un sueldo trae consigo Seguridad Social, posibles indemnizaciones, equipo, formación continua y el tiempo que se tarda en encontrar y formar a la persona adecuada —que en perfiles de IA no es corto.',
            'Una consultoría trae un coste por proyecto (o recurrente si hay mantenimiento), sin cargas laborales, pero también sin la disponibilidad ni la memoria acumulada de alguien interno.',
          ],
        },
        {
          type: 'p',
          text: 'Ninguna de las dos es «más barata» en abstracto. Depende de cuánto trabajo continuado haya realmente, no de cuánto se cree que va a haber.',
        },
        {
          type: 'example',
          label: 'Ejemplo',
          text: 'Si el trabajo real son 4-5 horas a la semana, un sueldo completo está sobredimensionado para eso. Si es un proyecto que necesita atención diaria durante meses, un proyecto puntual externo se queda corto y acaba encadenando facturas sin la continuidad que hacía falta desde el principio.',
        },
      ],
    },
    {
      id: 'cuando-conviene-plantilla',
      title: '3. Cuándo conviene más contratar en plantilla',
      blocks: [
        {
          type: 'ul',
          items: [
            'Cuando la IA va a ser parte central y continua de cómo funciona el negocio, no un proyecto puntual.',
            'Cuando hace falta iterar constantemente sobre algo que cambia cada semana.',
            'Cuando el conocimiento del negocio pesa tanto como el conocimiento técnico, y no se puede transferir del todo a un externo.',
            'Cuando ya hay volumen de trabajo suficiente para ocupar a una persona a tiempo, hoy, no «en el futuro».',
          ],
        },
        {
          type: 'p',
          text: 'Contratar demasiado pronto, antes de tener ese volumen, suele acabar en una persona cualificada con poco que hacer, o forzada a inventarse tareas para justificar el puesto.',
        },
      ],
    },
    {
      id: 'cuando-conviene-externa',
      title: '4. Cuándo conviene más una consultoría externa',
      blocks: [
        {
          type: 'ul',
          items: [
            'Cuando todavía no se sabe qué hace falta, y hace falta primero un diagnóstico honesto.',
            'Cuando el trabajo es puntual: poner algo en marcha, no mantenerlo indefinidamente.',
            'Cuando no hay volumen para justificar un puesto completo, pero sí para justificar un proyecto acotado.',
            'Cuando conviene una mirada sin los sesgos de quien lleva años dentro del mismo proceso.',
          ],
        },
        {
          type: 'callout',
          label: 'Cuándo NO conviene ninguna de las dos, todavía',
          variant: 'warn',
          text: 'Si ni siquiera hay claro qué problema se quiere resolver, contratar —sea externo o interno— es prematuro. Ese primer paso de definir el problema no siempre necesita presupuesto, sólo tiempo bien dedicado.',
        },
      ],
    },
    {
      id: 'el-modelo-mixto',
      title: '5. El modelo que casi nunca se menciona: empezar externo, después internalizar',
      blocks: [
        {
          type: 'p',
          text: 'La opción más razonable, en muchos casos, no es elegir un bando para siempre. Es usar una consultoría externa para la fase de diagnóstico y puesta en marcha —donde el criterio experto pesa más y el compromiso a largo plazo pesa menos— y, si el uso continuado lo justifica, incorporar después a alguien en plantilla que mantenga y haga crecer lo construido.',
        },
        {
          type: 'p',
          text: 'Para que esto funcione, es imprescindible que el trabajo externo deje documentación clara y no dependa de conocimiento que sólo tiene el proveedor. Si un proveedor externo no puede explicarte cómo entregaría el relevo a alguien de tu equipo, ese es un problema del proveedor, no una limitación del modelo.',
        },
      ],
    },
  ],
  conclusion: [
    {
      type: 'h3',
      text: 'En resumen',
    },
    {
      type: 'ol',
      items: [
        'Pregúntate si es un proyecto con final o una función continua: eso decide más que el precio.',
        'Compara el coste completo, no un sueldo bruto contra un presupuesto de proyecto.',
        'No contrates en plantilla antes de tener volumen real de trabajo.',
        'No sigas gastando en externo si lo que necesitas es continuidad diaria.',
        'Considera el modelo mixto: diagnóstico y arranque fuera, mantenimiento dentro, si el volumen lo justifica.',
      ],
    },
  ],
}
