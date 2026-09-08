import type { IconName } from '@/components/ui/Icon'

/**
 * Las soluciones, agrupadas por el resultado de negocio que persiguen —
 * no por la tecnología que usan.
 *
 * Convive con `services.ts` a propósito: los servicios son lo que se
 * contrata (con su precio y su alcance); las soluciones son la forma de
 * explicar, en lenguaje de negocio, para qué sirve todo eso junto. El
 * `apellido` en inglés existe porque es el término con el que muchos
 * responsables se han topado antes; el nombre que manda es el español.
 *
 * En la home alimentan `SolutionsSection`. Cuando existan las páginas de
 * detalle (`/soluciones/:slug`), este mismo array las alimentará, igual
 * que `services.ts` alimenta `/servicios/:slug`.
 */
export type Solution = {
  slug: string
  name: string
  /** Término en inglés, como referencia secundaria. Nunca sustituye al nombre. */
  apellido: string
  icon: IconName
  /** La pregunta de negocio que responde. */
  pregunta: string
  problema: string
  solucion: string
  incluye: string[]
}

export const solutions: Solution[] = [
  {
    slug: 'ingresos',
    name: 'IA para vender más',
    apellido: 'AI Revenue',
    icon: 'target',
    pregunta: '¿Cómo usamos la IA para vender más?',
    problema:
      'Se generan contactos, pero el seguimiento depende de que alguien se acuerde. Los que no compran hoy se pierden, y nadie vuelve a ellos.',
    solucion:
      'Automatizamos el recorrido comercial: entra el contacto, se investiga, se cualifica, se registra y se le hace seguimiento. La conversación de verdad la sigue teniendo una persona.',
    incluye: [
      'Cualificación y priorización de contactos',
      'Investigación previa antes de la primera llamada',
      'Ficha de cliente actualizada sin escribirla a mano',
      'Seguimientos y recordatorios que no dependen de la memoria',
      'Reactivación de contactos antiguos',
    ],
  },
  {
    slug: 'operaciones',
    name: 'IA para operaciones',
    apellido: 'AI Operations',
    icon: 'gears',
    pregunta: '¿Qué trabajo está haciendo una persona que podría hacer un sistema?',
    problema:
      'Hay tareas que se repiten idénticas cada semana y consumen horas sin aportar criterio: copiar datos, rellenar plantillas, clasificar correo, preparar el mismo informe.',
    solucion:
      'Identificamos qué parte del proceso es repetitiva de verdad y la dejamos funcionando sola, con revisión humana en los puntos donde equivocarse cuesta caro.',
    incluye: [
      'Procesado y lectura de documentos',
      'Clasificación y respuesta de correo',
      'Informes que se generan solos',
      'Traspaso de datos entre herramientas',
      'Plan ante fallos: qué pasa cuando algo se rompe',
    ],
  },
  {
    slug: 'atencion-al-cliente',
    name: 'IA para atención al cliente',
    apellido: 'AI Customer Operations',
    icon: 'chat',
    pregunta: '¿Cómo atendemos mejor sin contratar más gente?',
    problema:
      'Las mismas consultas, muchas veces al día y fuera de horario. Y cuando llega una que sí es delicada, se mezcla con el resto.',
    solucion:
      'Un sistema de atención conectado a la web, el correo y el teléfono, que resuelve lo repetitivo con la información de tu empresa y escala a una persona lo que lo merece. No es un chatbot suelto: es el circuito completo.',
    incluye: [
      'Atención en web, correo y otros canales',
      'Respuestas basadas en tu documentación, no inventadas',
      'Clasificación de consultas e incidencias',
      'Escalado a una persona con el contexto ya recogido',
      'Registro de lo que más se pregunta',
    ],
  },
  {
    slug: 'agentes',
    name: 'Agentes de IA',
    apellido: 'AI Agents',
    icon: 'spark',
    pregunta: '¿Puede un sistema ejecutar un proceso entero, y no solo redactar?',
    problema:
      'Muchas herramientas de IA generan texto y ahí se acaban. El trabajo real es el proceso completo: consultar, decidir, actuar y avisar a alguien.',
    solucion:
      'Diseñamos agentes que ejecutan procesos de principio a fin dentro de límites definidos por ti: consultan la información, usan las herramientas que ya tienes, actúan y pasan a una persona lo que se sale del guion.',
    incluye: [
      'Definición de qué puede y qué no puede hacer el agente',
      'Conexión con tus herramientas actuales',
      'Punto de escalado a una persona, siempre',
      'Registro de cada acción ejecutada',
      'Pruebas con casos reales antes de dejarlo funcionando',
    ],
  },
  {
    slug: 'conocimiento-interno',
    name: 'Conocimiento interno',
    apellido: 'AI Knowledge',
    icon: 'book',
    pregunta: '¿Cómo dejamos de buscar lo que ya está escrito?',
    problema:
      'La información existe: manuales, procedimientos, contratos, correos. El problema es encontrarla, y acaba resolviéndose preguntando al compañero.',
    solucion:
      'Convertimos tu documentación en un sistema al que se le pregunta en lenguaje normal y que responde citando de dónde ha sacado cada cosa. Si no está en la documentación, lo dice.',
    incluye: [
      'Conexión con documentos, manuales y procedimientos',
      'Respuestas con la fuente citada',
      'Control de quién puede consultar qué',
      'Detección de documentación desactualizada o duplicada',
    ],
  },
  {
    slug: 'datos',
    name: 'Preparación de datos',
    apellido: 'AI Data Readiness',
    icon: 'layers',
    pregunta: '¿Están nuestros datos listos para que la IA sirva de algo?',
    problema:
      'La IA sólo es tan útil como los datos y los sistemas que tiene debajo. Cuando la información está duplicada, desconectada o incompleta, cualquier automatización hereda ese desorden.',
    solucion:
      'Antes de implantar nada, revisamos dónde está cada dato, qué sistemas hay que conectar, qué está repetido y quién debe poder acceder a qué. A veces esta fase es todo lo que hace falta.',
    incluye: [
      'Inventario de datos y sistemas',
      'Detección de información duplicada o inconsistente',
      'Mapa de integraciones necesarias',
      'Permisos y niveles de acceso',
    ],
  },
  {
    slug: 'gobernanza',
    name: 'Gobernanza de IA',
    apellido: 'AI Governance',
    icon: 'shield',
    pregunta: '¿Quién controla lo que la IA hace dentro de la empresa?',
    problema:
      'Cuando cada equipo usa la herramienta que quiere, nadie sabe qué se está enviando fuera, con qué datos, ni quién autorizó qué.',
    solucion:
      'Ponemos orden operativo: qué herramientas se usan, con qué datos, quién puede hacer qué, qué queda registrado y quién supervisa. No es asesoría legal, es control del día a día.',
    incluye: [
      'Inventario de herramientas de IA en uso',
      'Normas internas de uso y permisos',
      'Registro y trazabilidad de lo que hacen los sistemas',
      'Puntos de supervisión humana',
      'Criterios para evaluar proveedores',
    ],
  },
]

export const getSolution = (slug: string | undefined) => solutions.find((s) => s.slug === slug)
