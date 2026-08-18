/**
 * Diagnóstico orientativo de potencial de IA.
 *
 * Todo el cálculo ocurre en el navegador: no se envía nada a ningún servidor
 * y no se guarda ninguna respuesta. El resultado es una orientación sobre
 * dónde mirar, nunca una estimación de ahorro ni una promesa económica.
 */

export type Option = {
  label: string
  /** 0 = sin margen aparente, 3 = margen alto. */
  score: 0 | 1 | 2 | 3
  /** Áreas que se marcan como candidatas cuando se elige esta opción. */
  areas?: AreaKey[]
}

export type Question = {
  id: string
  question: string
  help?: string
  options: Option[]
}

export type AreaKey =
  | 'atencion'
  | 'documentos'
  | 'administracion'
  | 'contenido'
  | 'ventas'
  | 'procesos'
  | 'formacion'

export const areas: Record<AreaKey, { titulo: string; texto: string; herramientas: string }> = {
  atencion: {
    titulo: 'Atención al cliente',
    texto:
      'Un volumen alto de consultas repetidas indica margen para resolver en el momento lo que hoy espera a que alguien esté libre, dejando a las personas lo que exige criterio.',
    herramientas: 'Asistentes conversacionales sobre tu propia documentación, con derivación a persona.',
  },
  documentos: {
    titulo: 'Gestión documental',
    texto:
      'Cuando la información vive en documentos dispersos, se pierde tiempo buscándola y se responde con datos desactualizados.',
    herramientas: 'Buscadores internos sobre documentación, extracción automática de datos y clasificación.',
  },
  administracion: {
    titulo: 'Administración',
    texto:
      'Facturación, presupuestos, altas y seguimientos suelen seguir siempre los mismos pasos: es el terreno más directo para automatizar.',
    herramientas: 'Automatizadores de flujos conectados a tus herramientas de gestión y correo.',
  },
  contenido: {
    titulo: 'Contenido y comunicación',
    texto:
      'La producción sostenida de contenido se acelera mucho cuando existe una estructura definida y una revisión clara.',
    herramientas: 'Flujos de producción con modelos de lenguaje y programación de publicación.',
  },
  ventas: {
    titulo: 'Ventas y seguimiento',
    texto:
      'Los presupuestos sin respuesta y los contactos sin seguimiento son pérdidas silenciosas y fáciles de recuperar.',
    herramientas: 'Automatización de seguimiento, cualificación de contactos e integración con tu CRM.',
  },
  procesos: {
    titulo: 'Procesos internos',
    texto:
      'Mover información de una herramienta a otra a mano es el síntoma más claro de un proceso pendiente de integrar.',
    herramientas: 'Integraciones vía API entre las herramientas que ya utilizas.',
  },
  formacion: {
    titulo: 'Formación del equipo',
    texto:
      'Con herramientas ya disponibles y poco uso real, el cuello de botella no es tecnológico: es de método.',
    herramientas: 'Formación aplicada sobre tareas reales y plantillas de trabajo compartidas.',
  },
}

export const questions: Question[] = [
  {
    id: 'sector',
    question: '¿A qué se dedica tu actividad?',
    options: [
      { label: 'Comercio o tienda', score: 2, areas: ['atencion', 'contenido'] },
      { label: 'Servicios profesionales', score: 2, areas: ['administracion', 'documentos'] },
      { label: 'Hostelería o local físico', score: 2, areas: ['atencion'] },
      { label: 'Salud o consulta', score: 2, areas: ['atencion', 'documentos'] },
      { label: 'Industria, taller o técnico', score: 1, areas: ['procesos'] },
      { label: 'Educación o formación', score: 2, areas: ['contenido', 'documentos'] },
      { label: 'Trabajo por cuenta propia sin sector claro', score: 1, areas: ['administracion'] },
    ],
  },
  {
    id: 'tamano',
    question: '¿Cuántas personas trabajáis?',
    options: [
      { label: 'Solo yo', score: 2, areas: ['administracion'] },
      { label: 'Entre 2 y 5', score: 2, areas: ['administracion', 'procesos'] },
      { label: 'Entre 6 y 20', score: 3, areas: ['procesos', 'formacion'] },
      { label: 'Más de 20', score: 3, areas: ['procesos', 'formacion'] },
    ],
  },
  {
    id: 'repetitivas',
    question: '¿Cuánto de tu semana se va en tareas que haces siempre igual?',
    help: 'Piensa en lo que harías de memoria: rellenar, copiar, reenviar, repetir.',
    options: [
      { label: 'Casi nada', score: 0 },
      { label: 'Alrededor de un cuarto', score: 1, areas: ['procesos'] },
      { label: 'Cerca de la mitad', score: 3, areas: ['procesos', 'administracion'] },
      { label: 'La mayor parte', score: 3, areas: ['procesos', 'administracion'] },
    ],
  },
  {
    id: 'horas',
    question: '¿Cuántas horas a la semana dedicas a esas tareas repetitivas?',
    options: [
      { label: 'Menos de 3', score: 0 },
      { label: 'Entre 3 y 8', score: 2, areas: ['administracion'] },
      { label: 'Entre 8 y 15', score: 3, areas: ['administracion', 'procesos'] },
      { label: 'Más de 15', score: 3, areas: ['administracion', 'procesos'] },
    ],
  },
  {
    id: 'atencion',
    question: '¿Cómo atendéis las consultas de clientes?',
    options: [
      { label: 'Apenas recibimos consultas', score: 0 },
      { label: 'Una persona las contesta cuando puede', score: 2, areas: ['atencion'] },
      { label: 'Ocupa buena parte del día a alguien', score: 3, areas: ['atencion'] },
      { label: 'Tenemos un equipo dedicado', score: 3, areas: ['atencion', 'documentos'] },
    ],
  },
  {
    id: 'volumen',
    question: '¿Cuántas consultas recibís al día, aproximadamente?',
    options: [
      { label: 'Menos de 5', score: 0 },
      { label: 'Entre 5 y 20', score: 2, areas: ['atencion'] },
      { label: 'Entre 20 y 60', score: 3, areas: ['atencion'] },
      { label: 'Más de 60', score: 3, areas: ['atencion', 'procesos'] },
    ],
  },
  {
    id: 'documentos',
    question: '¿Trabajáis con documentos de los que hay que sacar información?',
    help: 'Presupuestos, contratos, albaranes, informes, fichas.',
    options: [
      { label: 'Casi nunca', score: 0 },
      { label: 'Algunos a la semana', score: 1, areas: ['documentos'] },
      { label: 'Todos los días', score: 3, areas: ['documentos'] },
      { label: 'Es el centro de nuestro trabajo', score: 3, areas: ['documentos', 'procesos'] },
    ],
  },
  {
    id: 'redes',
    question: '¿Producís contenido o publicaciones de forma habitual?',
    options: [
      { label: 'No', score: 0 },
      { label: 'De vez en cuando, sin ritmo fijo', score: 2, areas: ['contenido'] },
      { label: 'Cada semana', score: 3, areas: ['contenido'] },
      { label: 'A diario', score: 3, areas: ['contenido'] },
    ],
  },
  {
    id: 'ventas',
    question: '¿Cómo hacéis el seguimiento comercial?',
    options: [
      { label: 'No aplica a nuestra actividad', score: 0 },
      { label: 'De memoria, cuando nos acordamos', score: 3, areas: ['ventas'] },
      { label: 'Con una hoja de cálculo', score: 2, areas: ['ventas', 'procesos'] },
      { label: 'Con un CRM que usamos de verdad', score: 1, areas: ['ventas'] },
    ],
  },
  {
    id: 'administracion',
    question: '¿Cómo pasa la información entre vuestras herramientas?',
    options: [
      { label: 'Copiando y pegando a mano', score: 3, areas: ['procesos'] },
      { label: 'Algunas cosas están conectadas', score: 2, areas: ['procesos'] },
      { label: 'Casi todo está integrado', score: 1 },
      { label: 'Solo usamos una herramienta', score: 1, areas: ['formacion'] },
    ],
  },
]

export const maxScore = questions.length * 3

export type Level = { key: string; label: string; texto: string }

export function getLevel(score: number): Level {
  const pct = (score / maxScore) * 100
  if (pct >= 70)
    return {
      key: 'alto',
      label: 'Alto',
      texto:
        'Tu actividad tiene varias tareas repetitivas con reglas claras, que es exactamente el terreno donde la automatización devuelve tiempo rápido. Lo razonable es empezar por una sola área y medir el resultado antes de extenderlo.',
    }
  if (pct >= 45)
    return {
      key: 'medio',
      label: 'Medio',
      texto:
        'Hay margen en algunas áreas concretas, aunque no en todo. Conviene ser selectivo: una mejora bien elegida rendirá más que un proyecto amplio.',
    }
  if (pct >= 22)
    return {
      key: 'moderado',
      label: 'Moderado',
      texto:
        'El margen existe pero es acotado. Probablemente rinda más ordenar y simplificar procesos que incorporar herramientas nuevas.',
    }
  return {
    key: 'bajo',
    label: 'Bajo',
    texto:
      'Por lo que has respondido, hoy no hay un volumen de tarea repetitiva que justifique una implantación. Lo honesto es decírtelo: la mejor inversión ahora sería formarte en el uso cotidiano de la IA, no automatizar nada.',
  }
}

/** Áreas candidatas, ordenadas por número de señales recogidas. */
export function getAreas(answers: Record<string, number>): AreaKey[] {
  const counts = new Map<AreaKey, number>()
  for (const q of questions) {
    const idx = answers[q.id]
    if (idx === undefined) continue
    const opt = q.options[idx]
    if (!opt || opt.score < 2) continue
    for (const a of opt.areas ?? []) counts.set(a, (counts.get(a) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => k)
}
