import type { KnowledgeDoc } from './types'

export const iaAutonomos: KnowledgeDoc = {
  slug: 'ia-para-autonomos-y-profesionales',
  title: 'IA para autónomos y profesionales',
  summary:
    'Facturar, perseguir cobros, preparar presupuestos y contestar correos, todo después de la jornada real de trabajo. Por dónde empezar sin montar algo más complicado de mantener que de usar.',
  category: 'Sector',
  level: 'Iniciación',
  updated: '2026-08-19',
  intro: [
    {
      type: 'p',
      text: 'Cuando trabajas solo o en un equipo muy pequeño, el tiempo administrativo no es un gasto aparte: es tiempo que le quitas directamente al trabajo que factura, o a tu vida fuera de él. Esta guía recoge por dónde suele merecer la pena empezar, y por qué la trampa más habitual en este perfil no es «hacer poco», sino hacer demasiado.',
    },
  ],
  chapters: [
    {
      id: 'la-situacion-habitual',
      title: '1. La situación habitual',
      blocks: [
        {
          type: 'p',
          text: 'Facturar, perseguir cobros pendientes, preparar presupuestos y contestar correos —todo eso suele pasar después de la jornada real de trabajo, no durante ella. Es la parte del negocio que nadie ve y que rara vez se factura, pero que ocupa horas reales cada semana.',
        },
      ],
    },
    {
      id: 'donde-suele-merecer-la-pena',
      title: '2. Dónde suele merecer la pena empezar',
      blocks: [
        {
          type: 'h3',
          text: 'Presupuestos',
        },
        {
          type: 'p',
          text: 'Una plantilla que se rellena a partir de cuatro datos (cliente, servicio, alcance, precio) y sale lista para enviar ahorra el rato de «cómo lo redacto esta vez» cada vez que llega una consulta nueva.',
        },
        {
          type: 'h3',
          text: 'Seguimiento de cobros y presupuestos',
        },
        {
          type: 'p',
          text: 'Recordatorios automáticos de presupuestos que se quedaron sin respuesta y de facturas pendientes. Es la tarea que todo el mundo pospone por incomodidad, y la que más rentabilidad tiene automatizar: cada aviso enviado a tiempo es dinero que, si no, tardaría meses en llegar o no llegaría nunca.',
        },
        {
          type: 'h3',
          text: 'Correo',
        },
        {
          type: 'p',
          text: 'Clasificación por prioridad y borradores automáticos para las respuestas que se repiten (horarios, disponibilidad, preguntas frecuentes de clientes). No sustituye el criterio, pero evita escribir lo mismo por decimoquinta vez.',
        },
        {
          type: 'h3',
          text: 'Administración mensual',
        },
        {
          type: 'p',
          text: 'Preparar y ordenar la documentación que va a la gestoría cada mes, en vez de reunirla de golpe el último día.',
        },
      ],
    },
    {
      id: 'la-trampa-especifica',
      title: '3. La trampa específica de trabajar solo',
      blocks: [
        {
          type: 'callout',
          label: 'La advertencia más importante de esta guía',
          variant: 'warn',
          text: 'Cuando trabajas solo, la trampa no es automatizar poco: es montar un sistema tan complejo que mantenerlo te quite más tiempo del que ahorra. Sin un equipo de IT detrás, cada pieza que añades es una pieza que tienes que entender y arreglar tú cuando falla.',
        },
        {
          type: 'p',
          text: 'Una o dos automatizaciones bien hechas y bien entendidas valen más que cinco a medias. Empieza por la tarea que más rabia te da repetir, no por la lista completa de todo lo que en teoría se podría automatizar.',
        },
      ],
    },
    {
      id: 'como-empezar',
      title: '4. Cómo empezar esta semana',
      blocks: [
        {
          type: 'ol',
          items: [
            'Elige una sola tarea administrativa: la que más se repite o la que más pospones.',
            'Comprueba si la herramienta que ya usas (facturación, correo, calendario) tiene ya una función de IA integrada antes de buscar algo nuevo.',
            'Pruébalo dos semanas con datos reales, no con un caso de prueba inventado.',
            'Si funciona, automatiza la siguiente. Si no, entiende por qué antes de intentarlo con otra herramienta.',
          ],
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
        'El tiempo administrativo de un autónomo es tiempo real, aunque no se facture.',
        'Presupuestos, seguimiento de cobros y correo suelen ser el mejor punto de partida.',
        'No montes más de lo que puedas mantener tú solo.',
        'Una automatización bien entendida vale más que cinco a medias.',
      ],
    },
  ],
}
