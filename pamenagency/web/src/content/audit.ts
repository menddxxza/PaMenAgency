import type { IconName } from '@/components/ui/Icon'

/**
 * La Auditoría de IA: el punto de entrada comercial del sitio.
 *
 * Es deliberadamente concreta sobre lo que se entrega y lo que no. No
 * promete cifras de ahorro: el impacto se estima con los datos que aporta
 * la propia empresa, y así se dice. La misma línea que el diagnóstico
 * gratuito, que tampoco inventa números.
 */

export type AuditStep = {
  num: string
  titulo: string
  resumen: string
  texto: string
}

export const auditSteps: AuditStep[] = [
  {
    num: '01',
    titulo: 'Descubrir',
    resumen: 'Cómo funciona tu empresa hoy.',
    texto:
      'Hablamos con quien hace el trabajo, no sólo con quien lo dirige. Qué se hace cada semana, con qué herramientas, cuántas veces y qué parte consume tiempo sin aportar nada.',
  },
  {
    num: '02',
    titulo: 'Analizar',
    resumen: 'Separar lo repetitivo de lo que exige criterio.',
    texto:
      'Sólo lo primero es candidato a automatizarse. Revisamos también dónde están los datos y qué sistemas tendrían que hablarse para que algo funcione de verdad.',
  },
  {
    num: '03',
    titulo: 'Priorizar',
    resumen: 'Ordenar por impacto y esfuerzo.',
    texto:
      'No todo lo automatizable merece automatizarse. Cada oportunidad se ordena por lo que aporta y por lo que cuesta ponerla en marcha, y las que no compensan se descartan por escrito.',
  },
  {
    num: '04',
    titulo: 'Estimar el impacto',
    resumen: 'Con tus números, no con los de un estudio.',
    texto:
      'Calculamos el tiempo y el coste que hoy consume cada proceso a partir de los datos que nos das. Es una estimación basada en tu operativa, y se presenta como tal: nunca como una promesa de resultado.',
  },
  {
    num: '05',
    titulo: 'Recomendar',
    resumen: 'Qué haríamos, en qué orden y qué no tocaríamos.',
    texto:
      'Para cada oportunidad priorizada, la solución concreta: qué se automatiza, qué sigue en manos de una persona, qué herramientas intervienen y qué pasa cuando algo falla.',
  },
  {
    num: '06',
    titulo: 'Hoja de ruta',
    resumen: 'Por dónde empezar y cómo seguir.',
    texto:
      'Un plan por fases, empezando por algo pequeño que funcione y se pueda medir. Lo que se entrega es tuyo: puedes ejecutarlo con nosotros, con tu equipo o con quien quieras.',
  },
]

/** Columnas del Mapa de Oportunidades: lo que recibe la empresa al terminar. */
export const opportunityColumns: { titulo: string; texto: string; icon: IconName }[] = [
  {
    titulo: 'Proceso',
    texto: 'Qué parte concreta del negocio se está mirando.',
    icon: 'layers',
  },
  {
    titulo: 'Problema',
    texto: 'Qué cuesta hoy tiempo, dinero o clientes en ese proceso.',
    icon: 'alert',
  },
  {
    titulo: 'Solución',
    texto: 'Qué se implantaría y qué seguiría haciendo una persona.',
    icon: 'gears',
  },
  {
    titulo: 'Impacto',
    texto: 'Qué cambiaría, estimado con tus propios datos.',
    icon: 'gauge',
  },
  {
    titulo: 'Dificultad',
    texto: 'Qué hace falta para ponerlo en marcha y qué puede complicarlo.',
    icon: 'clock',
  },
  {
    titulo: 'Prioridad',
    texto: 'Por dónde empezar para que el primer resultado llegue pronto.',
    icon: 'target',
  },
]

/** Lo que la auditoría incluye y lo que deliberadamente no. */
export const auditIncluye = [
  'Revisión de las áreas donde la IA puede actuar: ventas, operaciones, atención, administración, conocimiento y datos.',
  'Mapa de oportunidades priorizadas, con las descartadas justificadas por escrito.',
  'Estimación de tiempo y coste actual de cada proceso, calculada con tus datos.',
  'Recomendación concreta por oportunidad, con el plan ante fallos incluido.',
  'Hoja de ruta por fases, empezando por lo pequeño que se pueda medir.',
]

export const auditNoIncluye =
  'No incluye implantación: la auditoría termina en el mapa y la hoja de ruta. Si después quieres que lo ejecutemos nosotros, se presupuesta aparte; y si el mapa concluye que la IA no te aporta lo suficiente, también te lo diremos.'
