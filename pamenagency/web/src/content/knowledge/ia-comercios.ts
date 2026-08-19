import type { KnowledgeDoc } from './types'

export const iaComercios: KnowledgeDoc = {
  slug: 'ia-para-comercios-y-tiendas',
  title: 'IA para comercios y tiendas',
  summary:
    'Cientos de fichas de producto sin describir, consultas repetidas sobre stock y envíos, devoluciones gestionadas una por una. Qué se puede aplicar en un comercio y dónde no conviene automatizar.',
  category: 'Sector',
  level: 'Iniciación',
  updated: '2026-08-19',
  intro: [
    {
      type: 'p',
      text: 'Un catálogo con cientos de referencias y un equipo pequeño para atenderlo es la situación más habitual del comercio, tanto online como físico con venta digital. Esta guía recoge dónde suele aplicarse bien la IA en este sector, y dónde automatizar sin revisar sale más caro que no automatizar.',
    },
  ],
  chapters: [
    {
      id: 'la-situacion-habitual',
      title: '1. La situación habitual',
      blocks: [
        {
          type: 'p',
          text: 'Cientos de fichas de producto sin describir del todo, consultas repetidas sobre tallas, stock y plazos de envío, y devoluciones que se gestionan una por una a mano. Cada una de estas tareas es pequeña por separado, pero juntas ocupan una parte considerable del día.',
        },
      ],
    },
    {
      id: 'donde-aplica-bien',
      title: '2. Dónde suele aplicarse bien',
      blocks: [
        {
          type: 'h3',
          text: 'Fichas de producto',
        },
        {
          type: 'p',
          text: 'Generar descripciones consistentes a partir de los atributos que ya tienes (material, tallas, medidas, uso) ahorra el trabajo repetitivo de redactar cada ficha desde cero. Un catálogo con descripciones parejas también ayuda a que el cliente confíe más en lo que compra.',
        },
        {
          type: 'h3',
          text: 'Preguntas previas a la compra',
        },
        {
          type: 'p',
          text: 'Tallas, plazos de envío y política de devoluciones contestadas al instante, en el canal donde pregunta el cliente. Es precisamente el momento en el que se decide la compra, y una respuesta que tarda horas suele perder la venta frente a otra tienda que responde en minutos.',
        },
        {
          type: 'h3',
          text: 'Postventa',
        },
        {
          type: 'p',
          text: 'Automatizar el circuito de devoluciones (confirmación, instrucciones, seguimiento) y el aviso proactivo del estado de un pedido reduce buena parte de los mensajes de «¿dónde está mi paquete?» antes de que lleguen a producirse.',
        },
      ],
    },
    {
      id: 'donde-no-conviene',
      title: '3. Dónde no conviene automatizar sin revisar',
      blocks: [
        {
          type: 'callout',
          label: 'El límite más importante en este sector',
          variant: 'warn',
          text: 'Publicar descripciones de producto generadas sin revisar acaba, casi siempre, en errores de producto —una talla mal indicada, un material equivocado— y esos errores se traducen directamente en devoluciones. La revisión antes de publicar no es un paso opcional.',
        },
        {
          type: 'p',
          text: 'Lo mismo aplica al stock: si la IA responde sobre disponibilidad con datos que no están sincronizados en tiempo real, promete algo que la tienda no puede cumplir. Antes de automatizar respuestas sobre stock, hay que asegurar que la fuente de esos datos esté actualizada.',
        },
      ],
    },
    {
      id: 'como-empezar',
      title: '4. Cómo empezar',
      blocks: [
        {
          type: 'ol',
          items: [
            'Identifica las 5-10 preguntas que más se repiten en atención al cliente y automatiza esas primero.',
            'Si generas descripciones de producto con IA, define quién las revisa antes de publicar y cuánto tiempo le dedica.',
            'Comprueba que cualquier dato de stock que uses esté sincronizado en tiempo real, no en una foto de hace días.',
            'Mide devoluciones antes y después: es el indicador más claro de si algo se está aplicando bien o generando más problemas de los que resuelve.',
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
        'Fichas de producto, preguntas previas a la compra y postventa son el punto de partida más habitual.',
        'La revisión de las descripciones generadas no es negociable: sin ella, aumentan las devoluciones.',
        'No automatices respuestas de stock si los datos que las alimentan no están al día.',
        'Mide devoluciones y tiempo de respuesta como indicadores de si está funcionando.',
      ],
    },
  ],
}
