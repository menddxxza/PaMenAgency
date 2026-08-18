export type Crack = {
  titulo: string
  texto: string
  /** Qué hacer al respecto. Sin esto, la sección sólo generaría miedo. */
  fix: string
}

/**
 * «Las grietas de la IA». El objetivo no es asustar: es enseñar a usarla
 * con criterio. Cada límite viene acompañado de qué hacer con él.
 */
export const cracks: Crack[] = [
  {
    titulo: 'Alucinaciones',
    texto:
      'Un modelo de lenguaje genera texto plausible, no texto verdadero. Cuando no sabe algo, la respuesta no se detiene: se inventa con el mismo tono seguro que cuando acierta.',
    fix: 'Verifica siempre datos, cifras, fechas, citas y referencias. Si no puedes comprobarlo, no lo publiques.',
  },
  {
    titulo: 'Falta de criterio',
    texto:
      'Puede redactar una decisión perfectamente argumentada sin tener ninguna capacidad para saber si esa decisión es buena para ti. No conoce las consecuencias, sólo la forma.',
    fix: 'La decisión sigue siendo tuya. Úsala para preparar opciones, no para elegir por ti.',
  },
  {
    titulo: 'Problemas de contexto',
    texto:
      'No sabe nada de tu situación salvo lo que le cuentas en la conversación. Sin contexto, responde a la media de todo lo que ha leído, que no es tu caso.',
    fix: 'Da contexto explícito: quién eres, para quién es, qué restricciones hay y qué formato necesitas.',
  },
  {
    titulo: 'Privacidad',
    texto:
      'Todo lo que escribes se envía a un tercero. Según la herramienta y el plan, puede conservarse o utilizarse para mejorar el servicio.',
    fix: 'Decide antes qué información no sale nunca: datos personales, sanitarios, contratos o material confidencial.',
  },
  {
    titulo: 'Información desactualizada',
    texto:
      'Su conocimiento tiene una fecha de corte. Si no consulta fuentes en tiempo real, hablará del mundo tal y como era, no como es.',
    fix: 'Para cualquier cosa reciente —normativa, precios, versiones— comprueba la fuente original.',
  },
  {
    titulo: 'Dependencia de herramientas',
    texto:
      'Un proceso construido sobre una sola herramienta hereda sus subidas de precio, sus cambios de condiciones y sus caídas.',
    fix: 'Documenta tus flujos y evita que un proceso crítico dependa de un único proveedor.',
  },
  {
    titulo: 'Sesgos',
    texto:
      'Aprende de textos escritos por personas, con sus desequilibrios incluidos. Eso aflora en selección, valoración o cualquier tarea con implicaciones sobre personas.',
    fix: 'No la uses como decisor en procesos que afecten a personas. Como apoyo, con revisión, sí.',
  },
  {
    titulo: 'Automatizaciones mal planteadas',
    texto:
      'Automatizar un proceso defectuoso no lo arregla: lo repite más rápido y en más sitios. Un error humano ocurre una vez; uno automatizado, mil.',
    fix: 'Arregla el proceso antes de automatizarlo, y define siempre qué pasa cuando algo falla.',
  },
  {
    titulo: 'Exceso de confianza',
    texto:
      'Cuanto mejor escribe, menos se revisa. La calidad de la redacción se confunde con la calidad del contenido, y ahí es donde entran los errores serios.',
    fix: 'Revisa siempre con más atención lo que mejor suena. Es donde menos se mira.',
  },
  {
    titulo: 'Coste invisible',
    texto:
      'Cinco suscripciones pequeñas, tiempo de aprendizaje y mantenimiento suman más de lo que parece. El coste real rara vez es el precio de la etiqueta.',
    fix: 'Revisa cada trimestre qué herramientas usas de verdad y cancela el resto.',
  },
]
