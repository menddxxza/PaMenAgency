import type { KnowledgeDoc } from './types'

export const iaQuitaTrabajo: KnowledgeDoc = {
  slug: 'la-ia-le-va-a-quitar-el-trabajo-a-mi-equipo',
  title: '¿La IA le va a quitar el trabajo a mi equipo?',
  summary:
    'Es la pregunta que más se calla y más pesa antes de meter IA en un negocio. Una respuesta honesta, sin la tranquilidad fácil de «no, para nada» ni el catastrofismo de «va a sustituir a todos».',
  category: 'Confianza',
  level: 'Iniciación',
  updated: '2026-08-19',
  intro: [
    {
      type: 'p',
      text: 'Es la pregunta que más se calla y más pesa antes de meter IA en un negocio, tanto por parte de quien decide como del equipo que lo va a usar. Merece una respuesta honesta, no la tranquilidad fácil de «no, para nada, es solo una ayuda» ni el catastrofismo de «va a sustituir a todo el mundo».',
    },
  ],
  chapters: [
    {
      id: 'lo-que-cambia-de-verdad',
      title: '1. Lo que cambia de verdad no es el puesto, son las tareas',
      blocks: [
        {
          type: 'p',
          text: 'Casi ningún puesto de trabajo es una sola tarea repetida todo el día: es un conjunto de tareas distintas, algunas mecánicas y otras que exigen criterio, trato con personas o responsabilidad. La IA se lleva bien con las primeras y mal con las segundas.',
        },
        {
          type: 'p',
          text: 'Cuando se automatiza una tarea concreta dentro de un puesto, lo habitual no es que el puesto desaparezca, sino que cambia su composición: menos tiempo en lo mecánico, más tiempo disponible para lo que exige a una persona de verdad.',
        },
        {
          type: 'callout',
          label: 'La pregunta útil',
          text: 'En lugar de «¿va a sustituir a alguien de mi equipo?», la pregunta que da respuestas reales es: «¿qué parte de lo que hace cada persona es mecánica, y qué gana esa persona si deja de hacerla a mano?».',
        },
      ],
    },
    {
      id: 'donde-el-miedo-tiene-razon',
      title: '2. Donde el miedo tiene parte de razón',
      blocks: [
        {
          type: 'p',
          text: 'Sería deshonesto decir que no cambia nada. Hay tareas que eran un puesto entero —o una parte grande de uno— y que, si son puramente mecánicas y de alto volumen, sí pueden reducirse de forma notable. Fingir que esto no ocurre nunca no ayuda a nadie a prepararse.',
        },
        {
          type: 'p',
          text: 'Lo que sí es cierto, con datos consistentes en el tiempo, es que la adopción de estas herramientas dentro de una empresa suele ser gradual, no de un día para otro, y que el margen para reorganizar tareas —en vez de reorganizar personas— es mayor de lo que el miedo inicial hace pensar.',
        },
      ],
    },
    {
      id: 'como-se-gestiona-bien',
      title: '3. Cómo se gestiona esto con un equipo, sin generar más miedo del necesario',
      blocks: [
        {
          type: 'ul',
          items: [
            'Habla de tareas, no de puestos. «Vamos a automatizar el envío de recordatorios» genera menos ansiedad —y es más preciso— que «vamos a meter IA en administración».',
            'Involucra a quien hace la tarea hoy en decidir cómo se automatiza. Nadie conoce mejor los matices de un proceso que quien lo ejecuta a diario.',
            'Sé transparente sobre qué se espera que cambie y qué no. El silencio genera más miedo que una respuesta incómoda.',
            'Si el tiempo liberado no se redirige a nada, la pregunta que se hará el equipo —con razón— es para qué sirvió.',
          ],
        },
      ],
    },
    {
      id: 'la-pregunta-que-no-se-hace',
      title: '4. La pregunta que casi nadie se hace',
      blocks: [
        {
          type: 'p',
          text: 'No es solo «¿qué se pierde?». Es también «¿qué se puede empezar a ofrecer que antes no salía a cuenta por el tiempo que costaba?». Muchas veces el tiempo liberado no se traduce en menos gente, sino en más servicio, más atención o más capacidad, sin ampliar plantilla al mismo ritmo que antes.',
        },
        {
          type: 'p',
          text: 'Esa es la diferencia entre usar la IA para recortar y usar la IA para crecer con el mismo equipo. La decisión de cuál de las dos se toma no la toma la tecnología: la toma quien dirige el negocio.',
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
        'La IA se lleva bien con tareas mecánicas y mal con criterio, trato humano y responsabilidad.',
        'Es deshonesto negar que algunas tareas de alto volumen sí se reducen de forma notable.',
        'Hablar de tareas concretas, no de puestos, reduce el miedo y precisa la conversación.',
        'El tiempo liberado puede usarse para recortar o para crecer: esa decisión es de negocio, no de la tecnología.',
      ],
    },
  ],
}
