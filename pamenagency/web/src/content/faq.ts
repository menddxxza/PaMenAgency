export type FaqItem = {
  q: string
  /** Cada elemento es un párrafo. */
  a: string[]
  categoria: 'General' | 'Trabajo' | 'Técnico' | 'Precio' | 'Datos'
}

/** Preguntas frecuentes. Se usan en la home, en /faq y en el schema FAQPage. */
export const faqs: FaqItem[] = [
  {
    categoria: 'General',
    q: '¿Qué hace exactamente PaMenAgency?',
    a: [
      'Ayudamos a personas, negocios y empresas a usar la Inteligencia Artificial con criterio: analizamos dónde puede aportar algo real, diseñamos e implementamos automatizaciones e integraciones, y formamos a quienes van a convivir con esos sistemas.',
      'También publicamos conocimiento abierto. Puedes leer nuestras guías, hacer el diagnóstico y aplicar lo que encuentres sin contratar nada.',
    ],
  },
  {
    categoria: 'General',
    q: '¿Necesito saber usar IA para trabajar con vosotros?',
    a: [
      'No. Una parte del trabajo consiste precisamente en explicar lo necesario en lenguaje claro. Si partes de cero, empezamos por ahí.',
      'Si prefieres empezar por tu cuenta, la sección «IA para todos» está pensada exactamente para eso.',
    ],
  },
  {
    categoria: 'General',
    q: '¿Trabajáis con particulares?',
    a: [
      'Sí. Hay personas que no tienen empresa y quieren aprender a usar la IA para su trabajo, sus estudios o sus proyectos. Ese caso entra en formación y en IA para productividad.',
    ],
  },
  {
    categoria: 'General',
    q: '¿Trabajáis con PYMEs y negocios pequeños?',
    a: [
      'Sí, y es una parte importante de lo que hacemos. Un negocio pequeño no necesita el mismo enfoque que una empresa grande: normalmente necesita una o dos mejoras concretas, no un proyecto largo.',
    ],
  },
  {
    categoria: 'Trabajo',
    q: '¿Qué tipo de automatizaciones hacéis?',
    a: [
      'Las que se apoyan en tareas repetitivas y con reglas identificables: clasificar y responder correo, preparar documentos, mover información entre herramientas, hacer seguimientos, generar informes periódicos o atender consultas habituales.',
      'Antes de automatizar revisamos el proceso: muchas veces el primer paso no es automatizar, sino eliminar pasos que sobran.',
    ],
  },
  {
    categoria: 'Trabajo',
    q: '¿Podéis analizar mi negocio?',
    a: [
      'Sí, es el punto de partida habitual. Puedes empezar tú mismo con el diagnóstico orientativo de la web y, si quieres profundizar, seguimos con una consultoría.',
    ],
  },
  {
    categoria: 'Técnico',
    q: '¿Qué herramientas utilizáis?',
    a: [
      'Depende del caso. Trabajamos con modelos de lenguaje comerciales, con automatizadores de flujos, con las APIs de las herramientas que ya usas y, cuando hace falta, con desarrollo a medida.',
      'No tenemos compromiso con ningún proveedor concreto. La herramienta se elige después de entender el problema, nunca antes.',
    ],
  },
  {
    categoria: 'Técnico',
    q: '¿Necesito contratar muchas herramientas?',
    a: [
      'Normalmente no, y reducir suscripciones suele ser uno de los primeros resultados. Es habitual encontrar negocios pagando tres herramientas que hacen lo mismo y ninguna al completo.',
    ],
  },
  {
    categoria: 'Técnico',
    q: '¿La IA puede sustituir a mis empleados?',
    a: [
      'No es así como lo planteamos. La IA hace bien las tareas repetitivas y con reglas claras; hace mal todo lo que exige criterio, contexto y responsabilidad.',
      'El resultado que buscamos es que las personas dediquen su tiempo a lo que sólo pueden hacer ellas, no que sobren.',
    ],
  },
  {
    categoria: 'Datos',
    q: '¿Mis datos están seguros?',
    a: [
      'Antes de implantar nada definimos qué información puede salir de tu organización y cuál no. Esa decisión condiciona qué herramientas se pueden usar, y no al revés.',
      'Cuando el caso lo exige, se trabaja con opciones que no reutilizan tus datos para entrenar modelos, o con modelos ejecutados en un entorno controlado.',
    ],
  },
  {
    categoria: 'Datos',
    q: '¿Tengo que avisar de que estoy usando IA con mis clientes?',
    a: [
      'Si tienes un sistema que conversa con personas —un asistente, un bot, una voz automática—, la normativa europea exige que quede claro que se está interactuando con una IA.',
      'Todos los asistentes que implementamos lo indican. Si ya tienes uno funcionando, conviene revisarlo.',
    ],
  },
  {
    categoria: 'Precio',
    q: '¿Cuánto cuesta implementar IA?',
    a: [
      'Depende del alcance, y cualquiera que dé una cifra sin conocer tu caso te está vendiendo humo. Una automatización acotada y un proyecto por áreas no tienen nada que ver.',
      'Lo que sí hacemos siempre es cerrar el alcance y el precio antes de empezar, para que no haya sorpresas a mitad.',
    ],
  },
  {
    categoria: 'Precio',
    q: '¿Cuánto tarda una implementación?',
    a: [
      'Una automatización concreta suele medirse en días o semanas. Un proyecto por áreas, en meses, y por fases.',
      'Preferimos entregar algo funcionando pronto antes que desaparecer medio año y volver con un proyecto entero.',
    ],
  },
  {
    categoria: 'Precio',
    q: '¿Puedo empezar con algo pequeño?',
    a: [
      'Es lo que recomendamos. Una mejora pequeña que funciona genera más cambio que un plan grande que nunca se termina de arrancar.',
    ],
  },
  {
    categoria: 'General',
    q: '¿Qué pasa si no sé qué necesito?',
    a: [
      'Es la situación más común, y no es un problema: averiguarlo forma parte del trabajo. Puedes empezar por el diagnóstico de la web para llegar a la conversación con algo concreto sobre la mesa.',
    ],
  },
  {
    categoria: 'Trabajo',
    q: '¿Trabajáis online?',
    a: [
      'Sí. El trabajo se puede hacer íntegramente en remoto: análisis, implementación y formación.',
    ],
  },
  {
    categoria: 'Trabajo',
    q: '¿Ofrecéis formación?',
    a: [
      'Sí, tanto para equipos como para personas concretas, adaptada al nivel de partida y a las tareas reales de quien la recibe.',
    ],
  },
  {
    categoria: 'General',
    q: '¿Puedo solicitar una consultoría?',
    a: [
      'Sí. Escríbenos desde el formulario de contacto contando en qué situación estás y te respondemos con una propuesta concreta o, si vemos que no te hace falta, con una alternativa más sencilla.',
    ],
  },
]
