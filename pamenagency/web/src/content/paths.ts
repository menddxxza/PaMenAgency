export type Path = {
  slug: string
  /** La frase tal y como la diría la persona. */
  quote: string
  answer: string
  steps: string[]
  /** A dónde lleva el botón de la tarjeta. */
  cta: { label: string; to: string }
}

/**
 * «IA para todos»: caminos de entrada según desde dónde llega la persona.
 * Ninguno exige contratar nada; todos llevan a algo que se puede hacer hoy.
 */
export const paths: Path[] = [
  {
    slug: 'no-se-nada',
    quote: 'No sé nada de IA',
    answer:
      'No hace falta entender cómo funciona por dentro, igual que no hace falta saber de motores para conducir. Lo que sí conviene entender es qué tipo de tareas hace bien y cuáles hace mal, porque ahí está toda la diferencia.',
    steps: [
      'Entiende qué es realmente: un sistema que predice texto plausible, no una fuente de verdad.',
      'Prueba una sola herramienta durante una semana, con tareas tuyas de verdad.',
      'Aprende a detectar cuándo se está inventando algo.',
      'Sólo después, plantéate para qué la quieres usar en serio.',
    ],
    cta: { label: 'Empezar por la guía base', to: '/conocimiento/convertir-la-ia-en-ventaja-real' },
  },
  {
    slug: 'uso-chatgpt',
    quote: 'Uso ChatGPT pero siento que no le saco partido',
    answer:
      'Es lo más común. Casi siempre pasa lo mismo: se pide poco contexto, se acepta la primera respuesta y se usa para tareas sueltas en vez de para procesos completos.',
    steps: [
      'Da contexto antes de pedir: quién eres, para quién es y qué formato quieres.',
      'Trabaja por iteraciones, no de un tirón. La primera respuesta es un borrador.',
      'Guarda lo que te funciona: si lo repites cada semana, conviértelo en plantilla.',
      'Verifica todo dato concreto: fechas, cifras, nombres y referencias.',
    ],
    cta: { label: 'Ver errores comunes', to: '/conocimiento/errores-comunes-al-usar-ia' },
  },
  {
    slug: 'tengo-negocio',
    quote: 'Tengo un negocio',
    answer:
      'Las oportunidades no están en lo espectacular, están en lo aburrido: lo administrativo, lo repetitivo y lo que siempre se hace igual. Ahí es donde se recuperan horas de verdad.',
    steps: [
      'Anota durante una semana todo lo que haces más de tres veces.',
      'Marca cuáles siguen siempre los mismos pasos.',
      'De esas, elige la que más tiempo te quita.',
      'Automatiza sólo esa y mide el resultado antes de seguir.',
    ],
    cta: { label: 'Hacer el diagnóstico', to: '/diagnostico' },
  },
  {
    slug: 'ahorrar-tiempo',
    quote: 'Quiero ahorrar tiempo',
    answer:
      'El tiempo no se ahorra usando más herramientas, sino quitando pasos. Antes de automatizar una tarea, conviene preguntarse si esa tarea tiene que existir.',
    steps: [
      'Divide la tarea en pasos concretos.',
      'Elimina los que no aportan nada a nadie.',
      'Automatiza los que siguen reglas fijas.',
      'Deja en manos de una persona los que exigen criterio.',
    ],
    cta: { label: 'Ver cómo automatizamos', to: '/servicios/automatizacion' },
  },
  {
    slug: 'ganar-dinero',
    quote: 'Quiero ganar dinero con IA',
    answer:
      'Con honestidad: la IA no genera dinero por sí sola. Lo que hace es reducir el coste de producir y permitirte ofrecer algo que antes no podías. El negocio sigue teniendo que existir.',
    steps: [
      'Descarta los atajos: si alguien te promete ingresos pasivos rápidos, se está financiando contigo.',
      'Busca dónde te ahorra coste en lo que ya haces. Eso es margen inmediato.',
      'Piensa qué servicio podrías ofrecer ahora que antes no era rentable por tiempo.',
      'Valida con clientes reales antes de invertir en herramientas.',
    ],
    cta: { label: 'Leer la guía de ventaja real', to: '/conocimiento/convertir-la-ia-en-ventaja-real' },
  },
  {
    slug: 'quiero-aprender',
    quote: 'Quiero aprender',
    answer:
      'Aprender IA con vídeos sueltos deja la sensación de saber mucho y no poder aplicar nada. Funciona mejor una ruta corta y aplicada sobre tareas propias.',
    steps: [
      'Fundamentos: qué es, qué no es y por qué se equivoca.',
      'Práctica dirigida: aplicarlo a tres tareas tuyas reales.',
      'Límites: aprender a detectar errores y a verificar.',
      'Composición: combinar varias herramientas en un flujo.',
    ],
    cta: { label: 'Ver el centro de conocimiento', to: '/conocimiento' },
  },
  {
    slug: 'que-herramientas',
    quote: 'No sé qué herramientas necesito',
    answer:
      'La pregunta correcta no es «qué herramienta uso», sino «qué problema tengo». La herramienta es la última decisión, y casi siempre son menos de las que crees.',
    steps: [
      'Define la tarea concreta y con qué frecuencia ocurre.',
      'Comprueba si lo que ya pagas hoy lo cubre.',
      'Prueba una alternativa gratuita antes de suscribirte a nada.',
      'Adopta una herramienta nueva sólo cuando la anterior se te quede corta.',
    ],
    cta: { label: 'Hablar con nosotros', to: '/contacto' },
  },
]

export const getPath = (slug: string) => paths.find((p) => p.slug === slug)
