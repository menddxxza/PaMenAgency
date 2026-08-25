import type { KnowledgeDoc } from './types'

export const iaClinicas: KnowledgeDoc = {
  slug: 'ia-en-clinicas-y-consultas',
  title: 'IA en clínicas y consultas',
  summary:
    'Agenda que se descuadra con cada cancelación, llamadas repetidas por precios y horarios, documentación que consume tiempo de consulta. Qué se puede automatizar en una clínica, y qué no se delega nunca a un sistema automático.',
  category: 'Sector',
  level: 'Iniciación',
  updated: '2026-08-19',
  intro: [
    {
      type: 'p',
      text: 'En una clínica o consulta, el tiempo administrativo compite directamente con el tiempo de atención al paciente. Esta guía recoge dónde la IA puede liberar parte de ese tiempo, y traza con claridad la línea que no se cruza: nada relacionado con diagnóstico, tratamiento o datos de salud se delega a un sistema automático.',
    },
  ],
  chapters: [
    {
      id: 'la-situacion-habitual',
      title: '1. La situación habitual',
      blocks: [
        {
          type: 'p',
          text: 'Una agenda que se descuadra con cada cancelación de última hora, llamadas repetidas preguntando precios y horarios, y documentación clínica que se acumula y consume tiempo que debería ser de consulta. Ninguna de estas tareas exige criterio médico, y aun así ocupan una parte significativa del día.',
        },
      ],
    },
    {
      id: 'donde-aplica-bien',
      title: '2. Dónde suele aplicarse bien',
      blocks: [
        {
          type: 'h3',
          text: 'Gestión de citas',
        },
        {
          type: 'p',
          text: 'Recordatorios automáticos antes de la cita reducen las ausencias sin aviso. Cuando alguien cancela, reasignar automáticamente ese hueco liberado a la lista de espera evita huecos vacíos en la agenda.',
        },
        {
          type: 'h3',
          text: 'Primer filtro de consultas',
        },
        {
          type: 'p',
          text: 'Preguntas puramente administrativas —horarios, precios, si se atiende a una aseguradora concreta, cómo llegar— se pueden responder al instante, con una derivación inmediata a una persona en cuanto la consulta deja de ser administrativa y pasa a ser clínica.',
        },
        {
          type: 'h3',
          text: 'Documentación administrativa',
        },
        {
          type: 'p',
          text: 'Estructurar notas y preparar borradores de informes administrativos (no clínicos) a partir de dictado o de apuntes sueltos, para que el profesional revise y firme, no para que decida por él.',
        },
      ],
    },
    {
      id: 'el-limite-que-no-se-cruza',
      title: '3. El límite que no se cruza',
      blocks: [
        {
          type: 'callout',
          label: 'Esto no es negociable',
          variant: 'warn',
          text: 'Nada relacionado con diagnóstico, tratamiento o datos de salud se delega a un sistema automático. Los datos sanitarios tienen una protección legal específica (más estricta que la de datos personales generales) y condicionan qué herramientas se pueden usar y cómo.',
        },
        {
          type: 'p',
          text: 'Esto significa, en la práctica: ninguna IA sugiere diagnósticos, ninguna IA decide tratamientos, y cualquier herramienta que toque datos de salud de pacientes necesita estar contratada bajo las garantías legales que exige ese tipo de dato —no basta con una herramienta genérica de propósito general.',
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
            'Separa con claridad lo administrativo de lo clínico antes de automatizar nada: la línea debe quedar explícita, no dar por hecho que «ya se entiende».',
            'Empieza por recordatorios de citas: es lo que menos riesgo tiene y suele dar el resultado más visible.',
            'Si vas a tratar datos de pacientes con alguna herramienta, confirma antes que cumple la normativa de datos de salud aplicable —no des por hecho que una herramienta general vale para esto.',
            'Cualquier filtro automático de consultas debe poder derivar a una persona en cualquier momento, sin fricción.',
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
        'Gestión de citas, primer filtro administrativo y documentación no clínica son el punto de partida habitual.',
        'Diagnóstico, tratamiento y datos de salud quedan siempre fuera de cualquier automatización.',
        'Los datos sanitarios exigen herramientas con garantías específicas, no herramientas genéricas.',
        'La derivación a una persona debe estar siempre disponible, sin fricción, en cuanto algo deja de ser administrativo.',
      ],
    },
  ],
}
