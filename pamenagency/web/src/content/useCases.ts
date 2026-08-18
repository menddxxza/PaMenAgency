import type { IconName } from '@/components/ui/Icon'

export type UseCase = {
  slug: string
  sector: string
  icon: IconName
  /** Situación típica del sector, en su propio lenguaje. */
  situacion: string
  /** Qué se puede mejorar. Ejemplos de aplicación, no casos de clientes. */
  mejoras: { titulo: string; texto: string }[]
  /** Dónde NO conviene meter IA en este sector. */
  limite: string
}

/**
 * Casos de uso por sector.
 *
 * Importante: son ejemplos de aplicación, no proyectos realizados. No se
 * atribuye ningún trabajo a ninguna empresa concreta.
 */
export const useCases: UseCase[] = [
  {
    slug: 'restaurantes',
    sector: 'Restaurantes y hostelería',
    icon: 'store',
    situacion:
      'Reservas por tres canales distintos, el mismo listado de alérgenos explicado veinte veces al día y reseñas que nadie tiene tiempo de contestar.',
    mejoras: [
      { titulo: 'Reservas centralizadas', texto: 'Unificar teléfono, web y redes en un único calendario, con confirmación y recordatorio automáticos.' },
      { titulo: 'Consultas frecuentes', texto: 'Horarios, carta, alérgenos, aparcamiento y accesibilidad respondidos al instante en el canal donde pregunta el cliente.' },
      { titulo: 'Reseñas', texto: 'Borradores de respuesta personalizados para revisar y publicar en un minuto.' },
      { titulo: 'Contenido', texto: 'Preparar publicaciones semanales de carta y novedades sin partir de cero cada vez.' },
    ],
    limite:
      'La atención en sala no se automatiza. Lo que se libera es tiempo de gestión para dedicarlo a lo que sí se nota en la mesa.',
  },
  {
    slug: 'clinicas',
    sector: 'Clínicas y consultas',
    icon: 'building',
    situacion:
      'Agenda que se descuadra con cada cancelación, llamadas repetidas por precios y horarios, y documentación clínica que consume tiempo de consulta.',
    mejoras: [
      { titulo: 'Gestión de citas', texto: 'Recordatorios automáticos y reasignación de huecos liberados para reducir ausencias.' },
      { titulo: 'Primer filtro de consultas', texto: 'Respuesta inmediata a preguntas administrativas, con derivación a persona en cuanto es clínico.' },
      { titulo: 'Documentación', texto: 'Estructurar notas y preparar informes administrativos a partir de dictado o borradores.' },
    ],
    limite:
      'Nada relacionado con diagnóstico, tratamiento o datos de salud se delega a un sistema automático. Los datos sanitarios exigen un tratamiento específico y condicionan qué herramientas pueden usarse.',
  },
  {
    slug: 'tiendas',
    sector: 'Tiendas y comercio',
    icon: 'store',
    situacion:
      'Cientos de fichas de producto sin describir, consultas sobre stock y envíos, y devoluciones gestionadas una por una a mano.',
    mejoras: [
      { titulo: 'Fichas de producto', texto: 'Generar descripciones consistentes a partir de atributos, revisadas antes de publicar.' },
      { titulo: 'Preguntas previas a la compra', texto: 'Tallas, plazos, envíos y devoluciones contestadas al momento, que es cuando se decide la compra.' },
      { titulo: 'Postventa', texto: 'Automatizar el circuito de devoluciones y el seguimiento de pedidos.' },
    ],
    limite:
      'Publicar descripciones generadas sin revisar acaba en errores de producto y en devoluciones. La revisión no es opcional.',
  },
  {
    slug: 'autonomos',
    sector: 'Autónomos y profesionales',
    icon: 'gauge',
    situacion:
      'Facturar, perseguir cobros, preparar presupuestos y contestar correos, todo después de la jornada real de trabajo.',
    mejoras: [
      { titulo: 'Presupuestos', texto: 'Plantillas que se rellenan a partir de cuatro datos y salen listas para enviar.' },
      { titulo: 'Seguimiento', texto: 'Recordatorios automáticos de presupuestos sin respuesta y de facturas pendientes.' },
      { titulo: 'Correo', texto: 'Clasificación por prioridad y borradores para lo que se repite.' },
      { titulo: 'Administración', texto: 'Preparar y ordenar la documentación mensual para la gestoría.' },
    ],
    limite:
      'Cuando trabajas solo, la trampa es montar un sistema tan complejo que mantenerlo te quite más tiempo del que ahorra. Una o dos automatizaciones bien hechas bastan.',
  },
  {
    slug: 'agencias',
    sector: 'Agencias y estudios',
    icon: 'sparkles',
    situacion:
      'Propuestas que se escriben desde cero cada vez, informes mensuales que consumen días y conocimiento repartido entre demasiadas cabezas.',
    mejoras: [
      { titulo: 'Propuestas', texto: 'Estructura común y borrador inicial a partir del briefing.' },
      { titulo: 'Informes', texto: 'Automatizar la recogida de datos y dejar el análisis para las personas.' },
      { titulo: 'Conocimiento interno', texto: 'Un buscador sobre vuestra propia documentación para dejar de preguntar por chat.' },
    ],
    limite:
      'La parte creativa y la relación con el cliente son el producto. Automatizarlas es competir en lo mismo que todos.',
  },
  {
    slug: 'inmobiliarias',
    sector: 'Inmobiliarias',
    icon: 'building',
    situacion:
      'Leads que llegan a cualquier hora y se enfrían, descripciones de inmuebles repetitivas y visitas mal filtradas.',
    mejoras: [
      { titulo: 'Respuesta inmediata', texto: 'Atender y cualificar el lead en el momento en que entra, no al día siguiente.' },
      { titulo: 'Descripciones', texto: 'Textos de inmueble a partir de características, con tono coherente en toda la cartera.' },
      { titulo: 'Filtrado', texto: 'Reunir presupuesto, zona y requisitos antes de organizar una visita.' },
    ],
    limite:
      'La negociación y la visita son el trabajo real. Lo que se automatiza es lo que ocurre antes.',
  },
  {
    slug: 'servicios',
    sector: 'Empresas de servicios',
    icon: 'gears',
    situacion:
      'Partes de trabajo en papel, planificación por teléfono e informes que se montan a final de mes copiando de varios sitios.',
    mejoras: [
      { titulo: 'Partes de trabajo', texto: 'Captura estructurada desde el móvil y volcado automático al sistema.' },
      { titulo: 'Planificación', texto: 'Avisos y confirmaciones automáticas a cliente y técnico.' },
      { titulo: 'Informes', texto: 'Generación periódica a partir de los datos ya registrados.' },
    ],
    limite:
      'Si los datos se registran mal en origen, automatizar sólo acelera el error. Primero se arregla la captura.',
  },
  {
    slug: 'educacion',
    sector: 'Educación y formación',
    icon: 'book',
    situacion:
      'Material que hay que actualizar cada curso, dudas repetidas fuera de horario y corrección que ocupa las tardes.',
    mejoras: [
      { titulo: 'Materiales', texto: 'Adaptar contenidos a distintos niveles partiendo de una misma base.' },
      { titulo: 'Dudas frecuentes', texto: 'Resolver lo administrativo y lo repetido para dejar tiempo a lo que sí requiere docente.' },
      { titulo: 'Preparación', texto: 'Generar ejercicios y variantes de práctica a partir del temario.' },
    ],
    limite:
      'La evaluación con consecuencias para el alumno no se delega a un sistema automático. Como apoyo a la corrección, con revisión, sí.',
  },
  {
    slug: 'creadores',
    sector: 'Creadores de contenido',
    icon: 'sparkles',
    situacion:
      'Un calendario que hay que alimentar constantemente, ideas que se pierden y publicación manual en cada plataforma.',
    mejoras: [
      { titulo: 'Investigación', texto: 'Reunir y resumir material de partida en una fracción del tiempo.' },
      { titulo: 'Reutilización', texto: 'Convertir una pieza larga en varias piezas cortas con el formato de cada canal.' },
      { titulo: 'Publicación', texto: 'Programación y distribución automatizadas.' },
    ],
    limite:
      'El criterio y la voz propia son lo único que no se puede copiar. Producir en masa sin ellos acelera el desgaste de la audiencia.',
  },
  {
    slug: 'pymes',
    sector: 'PYMEs en general',
    icon: 'compass',
    situacion:
      'Un equipo pequeño haciendo de todo, herramientas acumuladas sin plan y la sensación de ir siempre por detrás.',
    mejoras: [
      { titulo: 'Ordenar antes que añadir', texto: 'Revisar qué se paga, qué se usa y qué se duplica. Suele ser el primer ahorro.' },
      { titulo: 'Una automatización', texto: 'Empezar por la tarea que más horas consume, no por la más llamativa.' },
      { titulo: 'Formación', texto: 'Que el equipo sepa usar bien lo que ya tiene antes de comprar nada más.' },
    ],
    limite:
      'En una PYME el riesgo no es quedarse corto: es empezar un proyecto grande que nadie tiene tiempo de sostener.',
  },
]

export const getUseCase = (slug: string) => useCases.find((u) => u.slug === slug)
