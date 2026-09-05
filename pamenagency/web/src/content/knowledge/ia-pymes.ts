import type { KnowledgeDoc } from './types'

export const iaPymes: KnowledgeDoc = {
  slug: 'ia-para-pymes',
  title: 'IA para PYMEs',
  summary:
    'Un negocio con varios empleados no tiene las mismas necesidades que un autónomo ni que una empresa grande. Qué cambia, por dónde empezar y qué es probable que todavía no te haga falta.',
  category: 'Sector',
  level: 'Iniciación',
  updated: '2026-08-27',
  intro: [
    {
      type: 'p',
      text: 'Entre el autónomo que trabaja solo y la empresa con varios departamentos hay un tramo con reglas propias: suficiente gente para que la coordinación empiece a doler, pero sin equipo de IT ni presupuesto para herramientas de nivel corporativo. Esta guía es para ese tramo — negocios pequeños que ya no caben en «hazlo tú mismo», pero a los que la mayoría de soluciones del mercado les queda grande.',
    },
  ],
  chapters: [
    {
      id: 'la-situacion-habitual',
      title: '1. La situación habitual',
      blocks: [
        {
          type: 'p',
          text: 'La información vive repartida entre varias personas y ninguna tiene el cuadro completo. Alguien contesta las consultas de clientes cuando puede, entre otras tareas. Las herramientas se han ido añadiendo una a una, según hacía falta, y ahora nadie está seguro de si dos de ellas hacen lo mismo o si tres se hablan entre sí de verdad.',
        },
        {
          type: 'p',
          text: 'No es desorganización: es crecimiento normal. El problema aparece cuando se sigue operando como el primer año, con un equipo que ya es tres o cuatro veces más grande.',
        },
      ],
    },
    {
      id: 'donde-suele-merecer-la-pena',
      title: '2. Dónde suele merecer la pena empezar',
      blocks: [
        {
          type: 'h3',
          text: 'Atención al cliente',
        },
        {
          type: 'p',
          text: 'Responder lo repetido (horarios, precios, disponibilidad, estado de un pedido) sin que dependa de que una persona concreta esté libre en ese momento. Lo que sí necesita criterio sigue yendo a una persona — la diferencia es que deja de competir por el mismo tiempo que lo urgente.',
        },
        {
          type: 'h3',
          text: 'Administración y facturación',
        },
        {
          type: 'p',
          text: 'Presupuestos, facturas y seguimiento de cobros siguiendo siempre el mismo proceso, en vez de que cada persona del equipo lo haga un poco a su manera.',
        },
        {
          type: 'h3',
          text: 'Documentos e información interna',
        },
        {
          type: 'p',
          text: 'Un buscador sobre vuestra propia documentación (procedimientos, catálogo, condiciones) para que la respuesta a «¿cómo hacíamos esto?» no dependa de encontrar a la persona que lo recuerda.',
        },
        {
          type: 'h3',
          text: 'Ventas y seguimiento',
        },
        {
          type: 'p',
          text: 'Que un presupuesto enviado no se quede sin respuesta simplemente porque nadie se acordó de retomarlo. Un aviso automático a los pocos días suele recuperar tratos que ya se daban por perdidos.',
        },
      ],
    },
    {
      id: 'la-trampa-especifica',
      title: '3. La trampa específica de esta escala',
      blocks: [
        {
          type: 'callout',
          label: 'La advertencia más importante de esta guía',
          variant: 'warn',
          text: 'La trampa de una PYME no es la de un autónomo (montar demasiado para una sola persona). Es comprar varias herramientas sueltas, cada una para una necesidad, que ningún miembro del equipo llega a usar de forma constante porque no se hablan entre sí y nadie tiene tiempo de mantenerlas todas.',
        },
        {
          type: 'p',
          text: 'Antes de añadir una herramienta nueva, la pregunta útil es si ya tenéis algo que casi hace lo mismo. Ordenar lo que ya existe suele rendir más que sumar una pieza más al montón.',
        },
        {
          type: 'example',
          label: 'Lo que probablemente no haga falta todavía',
          text: 'Un sistema de IA a medida por departamento, un rol dedicado a mantener la IA, o automatizar procesos que solo ocurren un par de veces al mes. Eso es propio de empresas con varios departamentos (otro perfil, con otra guía), no de una PYME que empieza.',
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
            'Reúne al equipo y lista qué herramientas usa cada uno — es habitual descubrir duplicados en esta única conversación.',
            'Elige una sola tarea que se repita a diario y que dependa de una persona concreta: ese es el punto de partida.',
            'Antes de comprar algo nuevo, comprueba si alguna herramienta que ya pagáis tiene una función de IA que no habéis activado.',
            'Pruébalo con el equipo real durante dos semanas, no solo con quien lo propuso, y decide con eso si se extiende a la siguiente tarea.',
          ],
        },
        {
          type: 'callout',
          label: 'Si quieres ver soluciones ya construidas',
          text: 'IAPyme es el marketplace de PaMenAgency: catálogo real de automatizaciones y agentes hechos por otras pymes, en español y sin comisión por venta — un punto de partida más rápido que empezar desde cero.',
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
        'Una PYME no tiene ni las necesidades de un autónomo ni las de una empresa con varios departamentos: es un perfil propio.',
        'Atención al cliente, administración, documentación interna y seguimiento comercial suelen ser el mejor punto de partida.',
        'La trampa no es hacer poco, es acumular herramientas sueltas que el equipo no llega a usar de forma constante.',
        'Antes de comprar algo nuevo, comprueba qué ya tienes que casi hace lo mismo.',
      ],
    },
  ],
}
