/**
 * Novedades de la web.
 *
 * Es una señal de que el sitio está vivo, no un blog de marketing: cada
 * entrada documenta algo que de verdad se ha añadido, con su fecha real.
 * Nada de anuncios inventados ni de relleno — si en un mes no ha cambiado
 * nada significativo, no se añade nada ese mes.
 */
export type Update = {
  fecha: string
  titulo: string
  texto: string
  /** Enlace a lo que se cuenta, si existe una página propia. */
  to?: string
}

export const updates: Update[] = [
  {
    fecha: '2026-09-21',
    titulo: 'Cuánto se gana con lo repetitivo',
    texto:
      'Añadimos una comparación en la portada entre hacer a mano las tareas que se repiten y hacerlas con IA, y casos de ejemplo por sector para verlo aplicado a un negocio concreto.',
    to: '/',
  },
  {
    fecha: '2026-09-17',
    titulo: 'Quién hay detrás de PaMenAgency',
    texto:
      'Añadimos una sección con quién lleva la agencia, su experiencia y sus productos propios. Preferimos que sepas con quién hablas antes de escribirnos.',
    to: '/nosotros',
  },
  {
    fecha: '2026-09-17',
    titulo: 'Precios de entrada revisados',
    texto:
      'Bajamos el precio de entrada de varios servicios para que probar no dependa de un presupuesto grande. Siguen siendo orientativos: el alcance real se acuerda en la conversación.',
    to: '/servicios',
  },
  {
    fecha: '2026-09-09',
    titulo: 'Sectores, escenarios y calculadora de coste',
    texto:
      'Diez sectores con sus fricciones típicas, tres escenarios de transformación explicados de principio a fin, y una calculadora que hace las cuentas con tus propios datos, sin inventar ahorros.',
    to: '/sectores',
  },
  {
    fecha: '2026-09-09',
    titulo: 'Auditoría de IA',
    texto:
      'La pieza central de la web: un proceso de seis pasos para encontrar dónde tiene sentido meter IA en tu negocio y dónde no, con su propio formulario de solicitud.',
    to: '/auditoria-ia',
  },
]
