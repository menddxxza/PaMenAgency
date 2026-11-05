import type { IconName } from '@/components/ui/Icon'

export type Service = {
  slug: string
  name: string
  /** Frase corta para la card. */
  short: string
  /** Beneficio concreto, no adjetivos. */
  benefit: string
  /** Rango de precio orientativo. Varía según alcance: nunca es una cifra cerrada. */
  priceRange: string
  /** Versión corta de priceRange para la tarjeta del listado — el mismo
   *  mínimo honesto, no una cifra nueva. */
  priceFrom: string
  icon: IconName
  /** Contenido de la página de detalle. */
  detail: {
    intro: string
    /** Qué hacemos exactamente. */
    incluye: string[]
    /** Para quién tiene sentido. */
    paraQuien: string[]
    /** Cómo se desarrolla el trabajo. */
    proceso: { titulo: string; texto: string }[]
    /** Cuándo NO merece la pena. Honestidad antes que venta. */
    cuandoNo: string
  }
}

/**
 * Catálogo de servicios (noviembre de 2026, plan maestro).
 *
 * Los cuatro primeros son los servicios para empresas del plan; Consultoría
 * y Formación se mantienen como complemento. Precios de partida decididos
 * por Pablo, sin IVA: el proyecto mínimo de cada uno es pequeño y está
 * delimitado, y cada proyecto se presupuesta según su alcance.
 *
 * Añadir un servicio = añadir un objeto a este array. La portada, el listado
 * /servicios, la ruta /servicios/:slug, el sitemap y el formulario de
 * contacto se generan a partir de aquí. Los servicios retirados redirigen
 * al más parecido (ver vercel.json).
 */
export const services: Service[] = [
  {
    slug: 'automatizacion-de-procesos',
    name: 'Automatización de procesos',
    short:
      'Hacemos que un proceso que hoy se hace a mano funcione solo: datos que se pasan entre programas, correos que se clasifican, avisos e informes que se generan sin que nadie los toque.',
    benefit: 'Dejas de dedicar horas cada semana a la misma tarea administrativa.',
    priceRange:
      'Desde 200 € (sin IVA) para un proceso sencillo y bien delimitado. Lo habitual es un proceso por proyecto; el precio final depende de cuántos pasos, herramientas y excepciones tenga.',
    priceFrom: 'Desde 200 €',
    icon: 'gears',
    detail: {
      intro:
        'Casi todas las empresas tienen un proceso que alguien repite cada día: copiar los datos de un formulario al CRM, reenviar correos al departamento que toca, actualizar una hoja con los pedidos o preparar el mismo informe cada lunes. Elegimos uno de esos procesos, lo diseñamos paso a paso y lo dejamos funcionando de forma automática, con una persona revisando donde sigue haciendo falta.',
      incluye: [
        'Análisis del proceso tal y como se hace hoy: pasos, herramientas, volumen y excepciones.',
        'Diseño del flujo automático, marcando los puntos donde decide o revisa una persona.',
        'Construcción con herramientas como n8n o Make, conectadas a los programas que ya usáis.',
        'Avisos cuando algo falla, registro de cada ejecución y reintentos ante errores.',
        'Pruebas con casos reales antes de ponerlo en marcha y documentación para que sepáis cómo funciona.',
      ],
      paraQuien: [
        'Empresas que pasan información de una herramienta a otra a mano.',
        'Equipos administrativos que repiten las mismas tareas cada día o cada semana.',
        'Negocios que reciben solicitudes por formularios o correo y las reparten a mano.',
      ],
      proceso: [
        { titulo: 'Elegir el proceso', texto: 'Escogemos uno concreto, con un inicio y un final claros.' },
        { titulo: 'Diseñar', texto: 'Dibujamos el flujo y acordamos qué se automatiza y qué no.' },
        { titulo: 'Construir y probar', texto: 'Lo montamos y lo probamos con casos reales de vuestra empresa.' },
        { titulo: 'Entregar', texto: 'Lo ponemos en marcha, os enseñamos a usarlo y dejamos la documentación.' },
      ],
      cuandoNo:
        'Si el proceso cambia cada semana o se hace muy pocas veces al año, automatizarlo cuesta más de lo que ahorra. Te lo diremos antes de empezar.',
    },
  },
  {
    slug: 'procesamiento-de-documentos',
    name: 'Procesamiento inteligente de documentos',
    short:
      'Un sistema que recibe facturas, albaranes, pedidos o contratos, lee sus datos con IA, los comprueba y los guarda, y manda a revisión humana los que tienen dudas.',
    benefit: 'Los datos de tus documentos llegan a tus sistemas sin teclearlos a mano.',
    priceRange:
      'Desde 300 € (sin IVA) para un solo tipo de documento con pocos campos. El precio final depende de cuántos tipos de documento haya, del volumen y de dónde tengan que acabar los datos.',
    priceFrom: 'Desde 300 €',
    icon: 'layers',
    detail: {
      intro:
        'Muchas empresas siguen tecleando a mano los datos de facturas, albaranes o pedidos que reciben en PDF o por correo. Montamos un sistema que recibe esos documentos, reconoce de qué tipo son, extrae los datos que importan (por ejemplo, en una factura: número, proveedor, NIF, fecha, base imponible, IVA y total), comprueba que cuadran y los guarda. Lo que no está claro no se da por bueno: pasa a una persona para que lo revise.',
      incluye: [
        'Recepción de documentos por correo, carpeta o formulario.',
        'Lectura de los datos con IA, incluidos documentos escaneados.',
        'Comprobaciones automáticas: campos obligatorios, importes que cuadran y documentos duplicados.',
        'Bandeja de revisión para los casos dudosos, con los datos editables antes de guardarlos.',
        'Panel con lo recibido, lo procesado, lo pendiente y los errores, con historial de cada documento.',
        'Envío de los datos validados a vuestra base de datos, hoja de cálculo, ERP o programa de facturación.',
      ],
      paraQuien: [
        'Departamentos de administración que reciben muchas facturas de proveedores.',
        'Empresas de logística o distribución que gestionan albaranes y pedidos.',
        'Cualquier equipo que pasa a mano datos de documentos a otro programa.',
      ],
      proceso: [
        { titulo: 'Muestras', texto: 'Revisamos ejemplos reales de vuestros documentos y qué datos necesitáis de cada uno.' },
        { titulo: 'Diseño', texto: 'Definimos las comprobaciones, la revisión humana y adónde van los datos.' },
        { titulo: 'Construcción', texto: 'Montamos el sistema y lo probamos con documentos reales.' },
        { titulo: 'Puesta en marcha', texto: 'Arranca con revisión humana de todo y se relaja a medida que demuestra fiabilidad.' },
      ],
      cuandoNo:
        'Si recibís pocos documentos al mes, teclearlos sigue siendo más barato. Y la IA no sustituye la revisión cuando un error tiene consecuencias económicas: por eso siempre hay una persona en los casos dudosos.',
    },
  },
  {
    slug: 'asistente-de-ia-empresarial',
    name: 'Asistente de IA para tu empresa',
    short:
      'Un asistente interno que responde a tu equipo usando los documentos de la empresa, dice de dónde saca cada respuesta y reconoce cuándo no lo sabe.',
    benefit: 'Tu equipo encuentra la información en segundos en lugar de preguntar o buscar en carpetas.',
    priceRange:
      'Desde 400 € (sin IVA) para un asistente sobre un conjunto pequeño de documentos. El precio final depende del volumen de documentación, de los permisos y de dónde tenga que funcionar.',
    priceFrom: 'Desde 400 €',
    icon: 'chat',
    detail: {
      intro:
        'Manuales, procedimientos, catálogos, condiciones o normas internas: la información existe, pero encontrarla cuesta. Montamos un asistente que responde a las preguntas del equipo basándose solo en vuestros documentos. Cada respuesta indica de qué documento sale, cada persona solo ve lo que tiene permiso para ver, y cuando no encuentra información suficiente lo dice en lugar de inventársela. No es un chatbot genérico: se diseña para resolver una necesidad concreta.',
      incluye: [
        'Selección y preparación de los documentos que va a usar el asistente.',
        'Respuestas con la referencia al documento y la parte de donde salen.',
        'Control de permisos: cada persona solo accede a la información que le corresponde.',
        'Respuesta de «no tengo información suficiente» cuando no encuentra base para contestar.',
        'Pruebas con preguntas reales del equipo y ajustes antes de entregarlo.',
      ],
      paraQuien: [
        'Empresas con mucha documentación interna que el equipo consulta a menudo.',
        'Equipos de atención o comerciales que necesitan respuestas rápidas sobre productos o condiciones.',
        'Organizaciones que incorporan personas nuevas y quieren que encuentren las respuestas solas.',
      ],
      proceso: [
        { titulo: 'Necesidad', texto: 'Definimos qué preguntas tiene que resolver y quién lo va a usar.' },
        { titulo: 'Documentación', texto: 'Reunimos y ordenamos los documentos y los permisos de acceso.' },
        { titulo: 'Construcción', texto: 'Montamos el asistente y lo probamos con preguntas reales.' },
        { titulo: 'Entrega', texto: 'Lo ponemos en marcha y revisamos las primeras semanas de uso.' },
      ],
      cuandoNo:
        'Si la documentación está desordenada o desactualizada, el asistente responderá con información desordenada o desactualizada. A veces el primer paso es ordenar los documentos, y te lo diremos.',
    },
  },
  {
    slug: 'integracion-de-sistemas',
    name: 'Integración de sistemas',
    short:
      'Conectamos entre sí los programas que ya usáis (CRM, ERP, facturación, pedidos, bases de datos) para que la información pase de uno a otro sola.',
    benefit: 'Dejas de copiar los mismos datos en varios programas y de tener versiones distintas en cada uno.',
    priceRange:
      'Desde 500 € (sin IVA) para conectar dos herramientas con una integración sencilla. El precio final depende de cuántos sistemas intervienen y de sus conexiones; los ERP especializados se presupuestan aparte.',
    priceFrom: 'Desde 500 €',
    icon: 'plug',
    detail: {
      intro:
        'Cuando el CRM no habla con la facturación y la facturación no habla con el almacén, alguien acaba copiando los mismos datos en varios sitios, con errores y versiones distintas. Conectamos esos programas mediante sus conexiones oficiales (APIs) para que un cliente nuevo, un pedido o una factura aparezcan solos donde hacen falta.',
      incluye: [
        'Revisión de los programas que usáis y de qué información tiene que pasar de uno a otro.',
        'Conexión entre sistemas a través de sus APIs o de herramientas como n8n.',
        'Reglas para evitar duplicados y decidir qué dato manda cuando hay diferencias.',
        'Registro de cada sincronización y aviso cuando algo falla.',
        'Panel o informe con la información unificada, si hace falta.',
      ],
      paraQuien: [
        'Empresas que usan varios programas que no se comunican entre sí.',
        'Equipos que copian clientes, pedidos o facturas de una herramienta a otra.',
        'Negocios con información repartida en hojas de cálculo y programas distintos.',
      ],
      proceso: [
        { titulo: 'Mapa', texto: 'Dibujamos qué sistemas hay y qué datos tienen que circular entre ellos.' },
        { titulo: 'Viabilidad', texto: 'Comprobamos qué permite cada programa antes de comprometer nada.' },
        { titulo: 'Construcción', texto: 'Hacemos las conexiones y las probamos con datos reales.' },
        { titulo: 'Entrega', texto: 'Las ponemos en marcha con supervisión y dejamos la documentación.' },
      ],
      cuandoNo:
        'Si alguno de los programas no permite conectarse (no tiene API ni forma de exportar), la integración no es viable o sale cara. Lo comprobamos antes de presupuestar. Para integraciones de ERP muy especializadas contamos con colaboradores.',
    },
  },
  {
    slug: 'consultoria-de-ia',
    name: 'Consultoría de IA',
    short:
      'Analizamos tu situación y te decimos dónde la IA aporta algo real y dónde no.',
    benefit: 'Sales con una lista priorizada de acciones, no con una idea vaga.',
    priceRange: 'Entre 20 € y 40.000 €, según el alcance de la consultoría.',
    priceFrom: 'Desde 20 €',
    icon: 'compass',
    detail: {
      intro:
        'La mayoría de proyectos de IA fallan antes de empezar, porque nadie se paró a mirar qué problema se estaba resolviendo. La consultoría es exactamente eso: mirar primero. Analizamos cómo trabajas hoy, dónde se te va el tiempo y qué partes de tu actividad son candidatas reales a mejorar con IA.',
      incluye: [
        'Sesión de análisis de tu actividad, tus procesos y tus herramientas actuales.',
        'Mapa de tareas: cuáles son repetitivas, cuáles dependen de criterio y cuáles no deberían tocarse.',
        'Identificación de oportunidades ordenadas por esfuerzo y por impacto.',
        'Recomendación de herramientas concretas, con su coste aproximado y sus límites.',
        'Documento final con las acciones priorizadas y el orden en que conviene abordarlas.',
      ],
      paraQuien: [
        'Personas o negocios que intuyen que la IA puede ayudarles pero no saben por dónde empezar.',
        'Empresas que ya han probado herramientas sueltas sin resultado claro.',
        'Quien va a invertir tiempo o dinero y prefiere hacerlo con un plan.',
      ],
      proceso: [
        { titulo: 'Conversación inicial', texto: 'Un diagnóstico de 30 minutos, gratis: entendemos a qué te dedicas y qué te duele. Sin tecnicismos.' },
        { titulo: 'Análisis', texto: 'Revisamos procesos, volúmenes, herramientas y puntos de fricción.' },
        { titulo: 'Priorización', texto: 'Ordenamos oportunidades por relación entre esfuerzo e impacto.' },
        { titulo: 'Entrega', texto: 'Te llevas un plan escrito que puedes ejecutar con nosotros o por tu cuenta.' },
      ],
      cuandoNo:
        'Si ya tienes claro qué quieres automatizar y solo necesitas que alguien lo construya, sáltate la consultoría y ve directo a automatización.',
    },
  },  {
    slug: 'formacion',
    name: 'Formación',
    short:
      'Enseñamos a usar correctamente las herramientas de IA, con sus capacidades y sus límites.',
    benefit: 'Tu equipo deja de depender de que alguien de fuera lo haga.',
    priceRange: 'Desde 100 €, dependiendo de lo que se quiera.',
    priceFrom: 'Desde 100 €',
    icon: 'book',
    detail: {
      intro:
        'Una implantación sin formación se abandona en tres meses. Formamos sobre tus casos reales, no sobre ejemplos de manual, y dedicamos tanto tiempo a lo que la IA hace mal como a lo que hace bien.',
      incluye: [
        'Sesiones adaptadas al nivel real del grupo, empezando desde cero si hace falta.',
        'Práctica sobre tareas de tu día a día.',
        'Bloque específico de límites, errores y verificación.',
        'Criterios de privacidad: qué información no debe salir de la organización.',
        'Material de consulta posterior.',
      ],
      paraQuien: [
        'Equipos que van a convivir con herramientas de IA.',
        'Personas que empiezan de cero y no quieren aprender a base de vídeos sueltos.',
      ],
      proceso: [
        { titulo: 'Nivel', texto: 'Medimos desde dónde parte el grupo antes de preparar nada.' },
        { titulo: 'Programa', texto: 'Adaptamos contenidos a las tareas reales de esas personas.' },
        { titulo: 'Sesiones', texto: 'Formación práctica, con ejercicios sobre casos propios.' },
        { titulo: 'Seguimiento', texto: 'Resolvemos dudas cuando aparecen al aplicarlo.' },
      ],
      cuandoNo:
        'Si nadie del equipo va a tener tiempo para practicar entre sesiones, la formación no cuaja. Mejor esperar a un momento con margen.',
    },
  },]

export const getService = (slug: string | undefined) =>
  services.find((s) => s.slug === slug)
