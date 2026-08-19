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
 * Catálogo de servicios.
 *
 * Añadir un servicio = añadir un objeto a este array. La rejilla de la home,
 * el listado `/servicios`, la ruta `/servicios/:slug`, el sitemap y los
 * selectores del formulario de contacto se generan a partir de aquí.
 */
export const services: Service[] = [
  {
    slug: 'consultoria-de-ia',
    name: 'Consultoría de IA',
    short:
      'Analizamos tu situación y te decimos dónde la IA aporta algo real y dónde no.',
    benefit: 'Sales con una lista priorizada de acciones, no con una idea vaga.',
    priceRange: 'Entre 90 € y 40.000 €, según el alcance de la consultoría.',
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
        { titulo: 'Conversación inicial', texto: 'Entendemos a qué te dedicas y qué te duele. Sin tecnicismos.' },
        { titulo: 'Análisis', texto: 'Revisamos procesos, volúmenes, herramientas y puntos de fricción.' },
        { titulo: 'Priorización', texto: 'Ordenamos oportunidades por relación entre esfuerzo e impacto.' },
        { titulo: 'Entrega', texto: 'Te llevas un plan escrito que puedes ejecutar con nosotros o por tu cuenta.' },
      ],
      cuandoNo:
        'Si ya tienes claro qué quieres automatizar y solo necesitas que alguien lo construya, sáltate la consultoría y ve directo a automatización.',
    },
  },
  {
    slug: 'automatizacion',
    name: 'Automatización',
    short:
      'Diseñamos procesos que se ejecutan solos para que dejes de hacer lo mismo cada día.',
    benefit: 'Recuperas horas concretas de la semana, medibles desde el primer mes.',
    priceRange: 'Entre 300 € y 8.000 €, según la complejidad del proceso.',
    icon: 'gears',
    detail: {
      intro:
        'Automatizar no es "poner una IA". Es identificar una secuencia de pasos que haces siempre igual y convertirla en un flujo que se dispara solo. Algunos de esos pasos usan IA; muchos otros no la necesitan, y decirlo forma parte del trabajo.',
      incluye: [
        'Mapa del proceso actual, paso a paso, tal y como se hace hoy.',
        'Diseño del flujo automatizado, con los puntos donde sigue haciendo falta una persona.',
        'Implementación y conexión de las herramientas implicadas.',
        'Pruebas con casos reales antes de dejarlo funcionando.',
        'Documentación para que puedas mantenerlo o modificarlo tú.',
      ],
      paraQuien: [
        'Negocios con tareas administrativas repetitivas: presupuestos, facturas, altas, seguimientos.',
        'Equipos que copian información de una herramienta a otra a mano.',
        'Profesionales que responden una y otra vez a las mismas consultas.',
      ],
      proceso: [
        { titulo: 'Observar', texto: 'Vemos cómo se hace hoy la tarea, con sus excepciones incluidas.' },
        { titulo: 'Simplificar', texto: 'Quitamos pasos innecesarios antes de automatizar nada.' },
        { titulo: 'Construir', texto: 'Montamos el flujo y lo probamos con datos reales.' },
        { titulo: 'Vigilar', texto: 'Revisamos el comportamiento durante las primeras semanas.' },
      ],
      cuandoNo:
        'Si un proceso cambia cada semana o se ejecuta tres veces al año, automatizarlo cuesta más de lo que ahorra. Te lo diremos.',
    },
  },
  {
    slug: 'integracion-de-ia',
    name: 'Integración de IA',
    short:
      'Conectamos tus herramientas y sistemas para que la información deje de moverse a mano.',
    benefit: 'Tus herramientas dejan de ser islas y empiezan a trabajar juntas.',
    priceRange: 'Entre 3.000 € y 6.000 €.',
    icon: 'plug',
    detail: {
      intro:
        'Casi nadie tiene un problema de falta de herramientas: tienen un problema de herramientas que no se hablan entre ellas. La integración consiste en unir lo que ya usas —CRM, correo, hojas de cálculo, tienda, mensajería, facturación— con capacidades de IA en los puntos donde aportan.',
      incluye: [
        'Inventario de las herramientas que ya utilizas y de los datos que maneja cada una.',
        'Diseño del flujo de información entre ellas.',
        'Conexiones mediante APIs, automatizadores o desarrollo a medida según el caso.',
        'Capa de IA sólo donde aporta: clasificar, resumir, extraer, redactar, priorizar.',
        'Control de errores: qué pasa cuando algo falla y quién se entera.',
      ],
      paraQuien: [
        'Empresas con varias herramientas y datos duplicados en todas ellas.',
        'Negocios que reciben información por canales distintos y la consolidan a mano.',
      ],
      proceso: [
        { titulo: 'Inventario', texto: 'Qué herramientas hay, qué guarda cada una y quién las usa.' },
        { titulo: 'Diseño', texto: 'Definimos el recorrido de cada dato y sus reglas.' },
        { titulo: 'Conexión', texto: 'Implementamos las integraciones y los controles de error.' },
        { titulo: 'Verificación', texto: 'Comprobamos consistencia con casos reales antes de abrir el flujo.' },
      ],
      cuandoNo:
        'Si tus herramientas actuales no tienen forma de conectarse y cambiarlas no es viable ahora, es mejor esperar que forzar una integración frágil.',
    },
  },
  {
    slug: 'asistentes-de-ia',
    name: 'Asistentes de IA',
    short:
      'Diseñamos e implementamos asistentes y sistemas conversacionales con un propósito claro.',
    benefit: 'Respuestas coherentes a cualquier hora, con límites definidos por ti.',
    priceRange: 'Entre 500 € y 15.000 €, según el alcance del asistente.',
    icon: 'chat',
    detail: {
      intro:
        'Un asistente útil no es el que habla bonito: es el que sabe qué puede responder, qué no y cuándo pasar la conversación a una persona. Trabajamos ese diseño antes que la tecnología, y lo construimos sobre tu información real.',
      incluye: [
        'Definición del alcance: qué debe resolver el asistente y qué debe derivar.',
        'Preparación de la base de conocimiento a partir de tu documentación.',
        'Diseño del tono y del comportamiento, incluida la respuesta ante lo que no sabe.',
        'Implementación en el canal que corresponda: web, mensajería, interno.',
        'Identificación como sistema de IA ante el usuario, como exige la normativa europea.',
        'Revisión de conversaciones reales para corregir desviaciones.',
      ],
      paraQuien: [
        'Negocios que reciben muchas consultas repetidas antes de vender.',
        'Equipos internos que pierden tiempo buscando información en documentos dispersos.',
      ],
      proceso: [
        { titulo: 'Alcance', texto: 'Acotamos qué entra y qué queda fuera del asistente.' },
        { titulo: 'Conocimiento', texto: 'Estructuramos tu información para que pueda consultarla.' },
        { titulo: 'Comportamiento', texto: 'Definimos tono, límites y ruta de escalado a persona.' },
        { titulo: 'Ajuste', texto: 'Revisamos conversaciones reales y corregimos lo que se desvía.' },
      ],
      cuandoNo:
        'Si tus consultas son siempre distintas y requieren criterio profesional, un asistente frustrará a tus clientes. Mejor automatizar la parte administrativa.',
    },
  },
  {
    slug: 'ia-para-empresas',
    name: 'IA para empresas',
    short:
      'Detectamos dónde tiene sentido aplicar IA dentro de una organización con varios equipos.',
    benefit: 'Un plan por áreas, no una herramienta suelta que nadie adopta.',
    priceRange: 'Entre 500 € y 9.000 €.',
    icon: 'building',
    detail: {
      intro:
        'En una empresa con varios departamentos el problema no es técnico, es de coordinación: cada área prueba cosas por su cuenta, nadie mide y la iniciativa se apaga. Trabajamos por áreas, con responsables identificados y con criterios de éxito acordados antes de empezar.',
      incluye: [
        'Diagnóstico por áreas: operaciones, atención, administración, comercial, marketing.',
        'Identificación de casos de uso con impacto medible.',
        'Criterios de decisión sobre datos: qué se puede enviar a un tercero y qué no.',
        'Plan por fases, con una prueba controlada antes de extender nada.',
        'Formación de los equipos que van a convivir con el sistema.',
      ],
      paraQuien: [
        'Organizaciones con varios departamentos y procesos ya definidos.',
        'Empresas que necesitan orden antes que herramientas.',
      ],
      proceso: [
        { titulo: 'Diagnóstico', texto: 'Entrevistas por área y revisión de procesos existentes.' },
        { titulo: 'Selección', texto: 'Elegimos uno o dos casos con impacto claro para empezar.' },
        { titulo: 'Prueba', texto: 'Implantación acotada, con métricas definidas de antemano.' },
        { titulo: 'Extensión', texto: 'Sólo si la prueba funciona, se lleva a más áreas.' },
      ],
      cuandoNo:
        'Si los procesos no están definidos, la IA amplificará el desorden. Primero orden, después automatización.',
    },
  },
  {
    slug: 'ia-para-pymes',
    name: 'IA para PYMEs',
    short:
      'Soluciones proporcionadas para negocios pequeños, sin infraestructura ni presupuestos grandes.',
    benefit: 'Mejoras que caben en tu día a día y en tu presupuesto.',
    priceRange: 'Entre 3.000 € y 12.000 €, con mantenimiento opcional desde 50 € a 250 € al mes.',
    icon: 'store',
    detail: {
      intro:
        'Un negocio de tres personas no necesita lo mismo que una empresa de trescientas, y aplicarle la misma receta es la forma más rápida de tirar el dinero. Aquí trabajamos con lo que ya tienes y buscamos la mejora más pequeña que produzca un cambio notable.',
      incluye: [
        'Revisión honesta de si necesitas IA o simplemente ordenar algo que ya haces.',
        'Una o dos automatizaciones concretas, no un proyecto interminable.',
        'Selección de herramientas con coste contenido y sin dependencias innecesarias.',
        'Explicación en lenguaje claro de cómo funciona y cómo mantenerlo.',
      ],
      paraQuien: [
        'Comercios, talleres, despachos, clínicas, hostelería y negocios locales.',
        'Autónomos que lo llevan todo y no tienen tiempo para investigar.',
      ],
      proceso: [
        { titulo: 'Escuchar', texto: 'Nos cuentas tu semana. Ahí está el problema, no en la tecnología.' },
        { titulo: 'Elegir una cosa', texto: 'Empezamos por una sola mejora, la que más tiempo te devuelva.' },
        { titulo: 'Montar', texto: 'Lo dejamos funcionando y te enseñamos a usarlo.' },
        { titulo: 'Revisar', texto: 'Comprobamos si de verdad te ha cambiado la semana.' },
      ],
      cuandoNo:
        'Si tu problema es que no llegan clientes, la automatización no lo resuelve. Te lo diremos antes de cobrarte nada.',
    },
  },
  {
    slug: 'ia-para-productividad',
    name: 'IA para productividad',
    short:
      'Te enseñamos a usar la IA para trabajar, estudiar, crear y organizarte mejor.',
    benefit: 'Dejas de pedirle cosas a una IA y empiezas a trabajar con ella.',
    priceRange:
      'Desde 30 €/mes por usuario con software comercial, o pago único de 2.000 € a 6.000 € por un sistema a medida.',
    icon: 'gauge',
    detail: {
      intro:
        'La diferencia entre alguien que le saca partido a la IA y alguien que no, casi nunca es la herramienta: es el método. Cómo pedir, cómo dar contexto, cómo revisar, cuándo desconfiar y qué tareas merecen delegarse.',
      incluye: [
        'Revisión de cómo trabajas ahora y de dónde se te va el tiempo.',
        'Método de trabajo con IA aplicado a tus tareas reales, no a ejemplos genéricos.',
        'Plantillas e instrucciones reutilizables para lo que repites cada semana.',
        'Criterios de revisión: cómo detectar cuándo la respuesta no es fiable.',
      ],
      paraQuien: [
        'Profesionales que escriben, analizan, preparan documentos o gestionan información.',
        'Estudiantes y personas en formación que quieren aprender bien desde el principio.',
        'Equipos pequeños que quieren un método común.',
      ],
      proceso: [
        { titulo: 'Diagnóstico', texto: 'Qué haces cada semana y cuánto tiempo te lleva.' },
        { titulo: 'Método', texto: 'Trabajamos la forma de pedir, dar contexto y revisar.' },
        { titulo: 'Plantillas', texto: 'Dejamos preparado lo que vas a repetir.' },
        { titulo: 'Práctica', texto: 'Se aplica sobre tus tareas reales hasta que sale solo.' },
      ],
      cuandoNo:
        'Si tu trabajo es casi todo presencial o manual, el margen es pequeño. Preferimos decirlo antes.',
    },
  },
  {
    slug: 'creacion-digital',
    name: 'Creación digital',
    short:
      'Usamos IA para acelerar la creación de contenido, webs, documentos y materiales digitales.',
    benefit: 'Produces más sin que se note que has producido más rápido.',
    priceRange:
      'Desde 20 € a 100 € al mes en licencias de software, o entre 2.500 € y 8.000 € por proyecto de flujos a medida.',
    icon: 'sparkles',
    detail: {
      intro:
        'La IA acelera la producción, pero no sustituye el criterio. Trabajamos el proceso completo: qué se produce, con qué estructura, con qué revisión y con qué identidad, para que el resultado no tenga ese aspecto genérico que todo el mundo reconoce a la primera.',
      incluye: [
        'Definición de la línea editorial o visual antes de producir nada.',
        'Flujos de producción de contenido, documentos y materiales digitales.',
        'Construcción de webs y páginas apoyada en IA donde acelera de verdad.',
        'Sistema de revisión para que nada salga sin criterio humano detrás.',
      ],
      paraQuien: [
        'Negocios que necesitan producir contenido de forma sostenida.',
        'Creadores y equipos de marketing con más ideas que horas.',
      ],
      proceso: [
        { titulo: 'Identidad', texto: 'Definimos tono, estructura y límites de lo que se produce.' },
        { titulo: 'Flujo', texto: 'Montamos el circuito de producción de principio a fin.' },
        { titulo: 'Revisión', texto: 'Establecemos el filtro humano antes de publicar.' },
        { titulo: 'Ritmo', texto: 'Ajustamos volumen a lo que se puede sostener.' },
      ],
      cuandoNo:
        'Si buscas volumen sin criterio, no somos el sitio. Ese camino desgasta la marca más de lo que aporta.',
    },
  },
  {
    slug: 'formacion',
    name: 'Formación',
    short:
      'Enseñamos a usar correctamente las herramientas de IA, con sus capacidades y sus límites.',
    benefit: 'Tu equipo deja de depender de que alguien de fuera lo haga.',
    priceRange: 'Entre 800 € y 6.000 € el curso completo, según su duración.',
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
  },
  {
    slug: 'estrategia-de-ia',
    name: 'Estrategia de IA',
    short:
      'Analizamos dónde merece la pena implementar IA y, sobre todo, dónde no.',
    benefit: 'Decisiones argumentadas, con el coste de no hacer nada incluido.',
    priceRange: 'Entre 1.000 € y 25.000 €, según el tamaño de la empresa.',
    icon: 'map',
    detail: {
      intro:
        'La parte más valiosa de una estrategia suele ser la lista de cosas que se descartan. Aquí se decide en qué orden se hacen las cosas, qué se descarta, con qué presupuesto y con qué criterios se sabrá si ha funcionado.',
      incluye: [
        'Análisis de tu posición actual y del margen real de mejora.',
        'Escenarios: qué pasa si se hace, qué pasa si no se hace nada.',
        'Priorización por impacto, coste, riesgo y dependencia de terceros.',
        'Criterios de medición definidos antes de implementar.',
        'Revisión de riesgos: privacidad, dependencia y cumplimiento normativo.',
      ],
      paraQuien: [
        'Empresas que van a destinar presupuesto y necesitan justificarlo.',
        'Negocios que han acumulado herramientas sin un plan detrás.',
      ],
      proceso: [
        { titulo: 'Situación', texto: 'Dónde estás hoy, con datos y no con impresiones.' },
        { titulo: 'Escenarios', texto: 'Qué caminos existen y qué cuesta cada uno.' },
        { titulo: 'Decisión', texto: 'Qué se hace, en qué orden y qué se descarta.' },
        { titulo: 'Medición', texto: 'Cómo sabremos dentro de tres meses si iba bien.' },
      ],
      cuandoNo:
        'Si el proyecto es una sola automatización concreta, no necesitas estrategia: necesitas ejecutarla.',
    },
  },
]

export const getService = (slug: string | undefined) =>
  services.find((s) => s.slug === slug)
