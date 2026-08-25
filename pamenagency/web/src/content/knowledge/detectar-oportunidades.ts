import type { KnowledgeDoc } from './types'

export const detectarOportunidades: KnowledgeDoc = {
  slug: 'como-detectar-oportunidades',
  title: 'Cómo detectar oportunidades de automatización',
  summary:
    'Un método para mirar tu propia actividad y encontrar qué merece automatizarse, qué conviene simplificar y qué debe quedarse como está.',
  category: 'Método',
  level: 'Intermedio',
  updated: '2026-08-18',
  intro: [
    {
      type: 'p',
      text: 'Detectar oportunidades no es una habilidad técnica: es una forma de mirar. Este documento describe cómo hacerlo sobre tu propia actividad, sin herramientas y sin conocimientos previos.',
    },
  ],
  chapters: [
    {
      id: 'las-cuatro-senales',
      title: '1. Las cuatro señales',
      blocks: [
        {
          type: 'p',
          text: 'Una tarea es candidata cuando cumple varias de estas condiciones. Cuantas más cumpla, mejor candidata es.',
        },
        {
          type: 'ol',
          items: [
            '**Frecuencia**: ocurre a menudo. Algo que pasa dos veces al año casi nunca compensa.',
            '**Estabilidad**: los pasos son siempre los mismos, con pocas excepciones.',
            '**Ausencia de criterio**: se aplica una regla, no se toma una decisión.',
            '**Trazabilidad**: si sale mal, se puede detectar y corregir sin daño grave.',
          ],
        },
        {
          type: 'callout',
          label: 'La cuarta importa más de lo que parece',
          variant: 'warn',
          text: 'Una tarea frecuente, estable y sin criterio, pero cuyo error sólo se descubre meses después y con consecuencias graves, es mala candidata aunque cumpla las otras tres.',
        },
      ],
    },
    {
      id: 'donde-mirar',
      title: '2. Dónde mirar primero',
      blocks: [
        {
          type: 'p',
          text: 'Hay cuatro lugares donde las oportunidades se acumulan casi siempre, en cualquier actividad.',
        },
        {
          type: 'h3',
          text: 'Los bordes entre herramientas',
        },
        {
          type: 'p',
          text: 'Cada vez que alguien copia información de un sitio y la pega en otro, hay una oportunidad. Ese gesto es el síntoma más fiable de un proceso sin integrar.',
        },
        {
          type: 'h3',
          text: 'Lo que se responde muchas veces',
        },
        {
          type: 'p',
          text: 'Si la misma pregunta llega veinte veces al día, no es un problema de atención: es información que no está donde el cliente la busca.',
        },
        {
          type: 'h3',
          text: 'Lo que se hace a final de mes',
        },
        {
          type: 'p',
          text: 'Informes, cierres, conciliaciones y recopilaciones periódicas suelen consistir en reunir datos que ya existen en otro sitio.',
        },
        {
          type: 'h3',
          text: 'Lo que se queda sin hacer',
        },
        {
          type: 'p',
          text: 'El seguimiento de presupuestos, los contactos que no se retomaron y las reseñas sin contestar. Aquí no se ahorra tiempo: se recupera algo que se estaba perdiendo.',
        },
      ],
    },
    {
      id: 'priorizar',
      title: '3. Priorizar entre candidatas',
      blocks: [
        {
          type: 'p',
          text: 'Con la lista delante, cada candidata se puntúa en dos ejes: cuánto impacto tiene y cuánto esfuerzo cuesta. La combinación define el orden.',
        },
        {
          type: 'ul',
          items: [
            '**Impacto alto, esfuerzo bajo**: se hace primero, sin discusión.',
            '**Impacto alto, esfuerzo alto**: se planifica, se divide en fases y se empieza por la primera.',
            '**Impacto bajo, esfuerzo bajo**: se hace si sobra tiempo, nunca antes que lo anterior.',
            '**Impacto bajo, esfuerzo alto**: se descarta por escrito, para no volver a discutirlo dentro de seis meses.',
          ],
        },
        {
          type: 'quote',
          text: 'La lista de descartes es tan valiosa como la de prioridades, porque evita repetir la misma conversación.',
        },
      ],
    },
    {
      id: 'validar',
      title: '4. Validar antes de construir',
      blocks: [
        {
          type: 'p',
          text: 'Antes de montar nada, la candidata elegida se prueba a mano durante una o dos semanas: se hace el proceso como se haría automatizado, pero ejecutado por una persona.',
        },
        {
          type: 'p',
          text: 'Esta prueba es barata y revela lo que ningún análisis sobre el papel detecta: las excepciones. Casi siempre aparecen dos o tres casos que nadie había mencionado, y son justo los que rompen una automatización mal diseñada.',
        },
        {
          type: 'ol',
          items: [
            'Ejecuta el proceso a mano siguiendo los pasos definidos.',
            'Anota cada vez que tengas que salirte del guion.',
            'Decide si esas excepciones se contemplan o se derivan a una persona.',
            'Sólo entonces, construye.',
          ],
        },
      ],
    },
  ],
  conclusion: [
    {
      type: 'p',
      text: 'Lo que se automatiza importa mucho menos que el orden en que se automatiza. Una primera automatización pequeña que funciona genera confianza para la segunda; una grande que se atasca detiene el proyecto entero durante un año.',
    },
  ],
}
