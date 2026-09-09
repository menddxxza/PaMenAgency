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
 * Alimentan la sección de la home (`SolutionsSection`), el índice
 * `/soluciones` y cada página de detalle `/soluciones/:slug`, igual que
 * `services.ts` alimenta `/servicios/:slug`. Añadir una entrada aquí crea
 * su página sola; recuerda añadir la colección al sitemap.
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
  /** Recorrido del proceso, de principio a fin. 5-6 nodos: más no se lee. */
  flujo: string[]
  paraQuien: string[]
  /** En qué caso desaconsejamos esta solución. Siempre hay uno. */
  cuandoNo: string
  /** Servicios de `services.ts` con los que se ejecuta esta solución. */
  servicios: string[]
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
    flujo: ['Entra el contacto', 'Se investiga', 'Se cualifica', 'Ficha al día', 'Seguimiento', 'Habla una persona'],
    paraQuien: [
      'Negocios que generan contactos pero pierden la mitad por no seguirlos.',
      'Equipos comerciales pequeños que dedican más tiempo a apuntar que a hablar.',
      'Empresas con una lista de clientes antiguos a la que nadie ha vuelto.',
    ],
    cuandoNo:
      'Si todavía no entran contactos suficientes, esto no es lo tuyo: automatizar un embudo vacío no lo llena. Primero hay que generar demanda, y eso es otro trabajo.',
    servicios: ['automatizacion', 'integracion-de-ia', 'consultoria-de-ia'],
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
    flujo: ['Llega el documento', 'Se lee y extrae', 'Se valida', 'Se registra', 'Aviso si algo falla', 'Informe'],
    paraQuien: [
      'Empresas con tareas administrativas que se repiten igual cada semana.',
      'Equipos que copian los mismos datos entre dos o tres herramientas.',
      'Negocios donde el cierre de mes se come días de trabajo.',
    ],
    cuandoNo:
      'Si el proceso cambia cada vez y depende del criterio de una persona, automatizarlo sale caro y frágil. Ahí es mejor apoyar a quien decide, no sustituir la decisión.',
    servicios: ['automatizacion', 'integracion-de-ia', 'ia-para-productividad'],
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
    flujo: ['Llega la consulta', 'Se entiende', 'Se busca en tu información', 'Se responde', 'Se registra', 'Escala si toca'],
    paraQuien: [
      'Negocios que reciben muchas consultas repetidas y fuera de horario.',
      'Equipos donde atender interrumpe constantemente otro trabajo.',
      'Empresas con información dispersa que dificulta responder rápido.',
    ],
    cuandoNo:
      'Si tu volumen de consultas es bajo o cada una es distinta y delicada, un sistema así aporta poco y añade un intermediario donde no hacía falta.',
    servicios: ['asistentes-de-ia', 'integracion-de-ia', 'consultoria-de-ia'],
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
    flujo: ['Recibe la tarea', 'Consulta los datos', 'Decide dentro de sus límites', 'Ejecuta', 'Deja registro', 'Avisa a una persona'],
    paraQuien: [
      'Procesos con varios pasos encadenados que hoy hace alguien a mano.',
      'Empresas que ya usan IA para redactar y se han quedado ahí.',
      'Equipos con herramientas conectables y un proceso bien definido.',
    ],
    cuandoNo:
      'Si el proceso no está claro ni escrito, un agente no lo va a ordenar: lo va a ejecutar mal más rápido. Primero se define el proceso, después se automatiza.',
    servicios: ['integracion-de-ia', 'automatizacion', 'estrategia-de-ia'],
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
    flujo: ['Se reúne la documentación', 'Se organiza', 'Se pregunta en lenguaje normal', 'Responde citando la fuente', 'Se detecta lo que falta'],
    paraQuien: [
      'Empresas con procedimientos escritos que nadie encuentra cuando hacen falta.',
      'Equipos donde la misma duda interna se resuelve preguntando al de al lado.',
      'Negocios que incorporan gente a menudo y repiten la misma explicación.',
    ],
    cuandoNo:
      'Si la documentación no existe o está desactualizada, esto no la arregla: un sistema que responde con información obsoleta es peor que no tener sistema. Primero hay que escribirla.',
    servicios: ['asistentes-de-ia', 'ia-para-empresas', 'formacion'],
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
    flujo: ['Inventario de sistemas', 'Dónde está cada dato', 'Qué está duplicado', 'Qué hay que conectar', 'Quién accede a qué'],
    paraQuien: [
      'Empresas con varias herramientas que no se hablan entre ellas.',
      'Negocios que han intentado automatizar algo y ha fallado por los datos.',
      'Equipos que no saben con seguridad dónde está la información buena.',
    ],
    cuandoNo:
      'Si trabajas con una sola herramienta y pocos datos, esta fase es un gasto innecesario: se ve a simple vista lo que hay y dónde está.',
    servicios: ['consultoria-de-ia', 'integracion-de-ia', 'estrategia-de-ia'],
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
    flujo: ['Qué se usa hoy', 'Con qué datos', 'Quién puede hacer qué', 'Qué queda registrado', 'Quién supervisa'],
    paraQuien: [
      'Empresas donde cada equipo ha empezado a usar IA por su cuenta.',
      'Negocios que manejan datos de clientes y necesitan saber por dónde circulan.',
      'Organizaciones que van a implantar varias automatizaciones a la vez.',
    ],
    cuandoNo:
      'Si sois dos personas y una sola herramienta, esto es burocracia prematura. La gobernanza empieza a compensar cuando hay varios equipos usando cosas distintas.',
    servicios: ['consultoria-de-ia', 'ia-para-empresas', 'formacion'],
  },
]

export const getSolution = (slug: string | undefined) => solutions.find((s) => s.slug === slug)
