export type BloqueContenido =
  | { tipo: 'p'; texto: string }
  | { tipo: 'h2'; texto: string }
  | { tipo: 'ul'; items: string[] };

export type PostBlog = {
  slug: string;
  titulo: string;
  resumen: string;
  fecha: string;
  categoria: string;
  contenido: BloqueContenido[];
};

export const POSTS_BLOG: PostBlog[] = [
  {
    slug: 'que-es-un-agente-de-ia',
    titulo: 'Qué es un agente de IA (explicado sin humo)',
    resumen:
      '"Agente de IA" se usa para vender casi cualquier cosa. Aquí tienes las diferencias reales entre automatización, bot y agente, y cómo saber cuál necesitas.',
    fecha: '2026-07-14',
    categoria: 'Guías',
    contenido: [
      {
        tipo: 'p',
        texto:
          'Si has mirado software para tu negocio últimamente, habrás visto la palabra "agente de IA" pegada a casi todo. Un formulario con IA es un agente. Un chatbot con tres respuestas fijas es un agente. Una automatización que manda un email es un agente. La palabra se ha vaciado de significado porque vende, no porque sea precisa.',
      },
      {
        tipo: 'p',
        texto:
          'No hace falta que te conviertas en experto técnico para comprar bien. Solo hace falta que sepas distinguir tres cosas, porque cada una resuelve un problema distinto y cuesta distinto.',
      },
      {
        tipo: 'h2',
        texto: 'Automatización: hace siempre lo mismo, sin decidir nada',
      },
      {
        tipo: 'p',
        texto:
          'Una automatización sigue una receta fija: "cuando pase X, haz Y". Si te llega un pedido, crea una factura. Si alguien rellena un formulario, añádelo a una hoja de cálculo. No entiende lenguaje natural, no decide nada, no se sorprende con nada que no hayas previsto. Es la opción más barata y más fiable para tareas repetitivas y bien definidas — precisamente porque no intenta "pensar".',
      },
      {
        tipo: 'h2',
        texto: 'Bot: sigue un guion, con ramas',
      },
      {
        tipo: 'p',
        texto:
          'Un bot añade una capa de decisiones simples encima de la automatización: "si el cliente escribe A, responde X; si escribe B, responde Y". Puede tener docenas de ramas y sonar bastante natural, pero sigue siendo un árbol de decisiones que alguien ha diseñado a mano. Se le puede escapar algo que no está en el guion — y cuando pasa, se nota.',
      },
      {
        tipo: 'h2',
        texto: 'Agente de IA: entiende, decide y actúa',
      },
      {
        tipo: 'p',
        texto:
          'Un agente de verdad usa un modelo de lenguaje para entender lo que le dicen —aunque no siga el guion previsto— y decide qué hacer con esa información, a menudo encadenando varias acciones: mirar tu calendario, comprobar el stock, responder de forma distinta según el contexto. No es magia, es software con un modelo de IA metido dentro que le da margen para improvisar dentro de unos límites. Por eso cuesta más construirlo bien, y por eso, cuando está bien construido, se le puede pedir cosas que a una automatización ni se le ocurrirían.',
      },
      {
        tipo: 'h2',
        texto: 'Cómo saber cuál necesitas',
      },
      {
        tipo: 'ul',
        items: [
          'Si la tarea es siempre igual y no requiere criterio (mover datos de un sitio a otro, generar un documento), una automatización te va a costar menos y a fallar menos.',
          'Si necesitas responder preguntas frecuentes con algo de variedad pero controlada, un bot bien diseñado es suficiente.',
          'Si necesitas que algo entienda matices, decida entre varias opciones o mantenga una conversación real, ahí es donde un agente de IA empieza a merecer la pena.',
        ],
      },
      {
        tipo: 'p',
        texto:
          'En IAPyme cada ficha dice de qué tipo es la solución — automatización, bot, agente, app, y el resto— precisamente para que no tengas que adivinarlo por el nombre. Si no lo tienes claro, pregúntaselo al buscador con IA de la portada: cuéntale qué quieres resolver y te dirá si hay algo que encaje de verdad, sin forzarte a elegir.',
      },
    ],
  },
  {
    slug: 'como-elegir-tu-primera-automatizacion',
    titulo: 'Cómo elegir tu primera automatización sin arrepentirte',
    resumen:
      'Comprar software para tu negocio da vértigo cuando no sabes de tecnología. Una checklist práctica antes de pagar por tu primera solución de IA.',
    fecha: '2026-07-28',
    categoria: 'Guías',
    contenido: [
      {
        tipo: 'p',
        texto:
          'La primera vez que compras una solución de IA para tu negocio, el riesgo no es que "la IA no funcione" — es pagar por algo que no encaja con cómo trabajas de verdad, y acabar sin usarlo. Esto no va de tecnología, va de comprar con criterio. Aquí tienes lo que de verdad importa mirar antes de decidirte.',
      },
      {
        tipo: 'h2',
        texto: '1. Que el problema esté escrito antes que la solución',
      },
      {
        tipo: 'p',
        texto:
          'Desconfía de cualquier ficha que empiece hablando de lo lista que es la tecnología. Una ficha seria empieza contándote el problema que tienes tú, en tus palabras, y solo después explica cómo lo resuelve. Si no reconoces tu propio problema en las primeras líneas, probablemente no es para ti.',
      },
      {
        tipo: 'h2',
        texto: '2. Qué necesitas tener tú, no solo qué hace la solución',
      },
      {
        tipo: 'p',
        texto:
          'Casi ninguna solución funciona sola: necesita una cuenta de WhatsApp Business, un calendario, un catálogo ya digitalizado. Si la ficha no dice claramente qué tienes que aportar tú, pregúntalo antes de pagar. Es la causa número uno de "lo compré y no lo pude instalar".',
      },
      {
        tipo: 'h2',
        texto: '3. Un tiempo de instalación creíble',
      },
      {
        tipo: 'p',
        texto:
          '"Listo en 5 minutos" suena bien pero rara vez es verdad para algo que se conecta a tus herramientas. Un tiempo de instalación en horas, no en minutos, suele ser señal de honestidad, no de que sea peor.',
      },
      {
        tipo: 'h2',
        texto: '4. Reseñas de gente que lo ha usado de verdad',
      },
      {
        tipo: 'p',
        texto:
          'Una demo bonita se puede preparar. Las reseñas de otros compradores, no. Si un producto lleva tiempo publicado y no tiene ninguna reseña, no es necesariamente malo — pero si tiene varias y todas mencionan el mismo problema, hazles caso.',
      },
      {
        tipo: 'h2',
        texto: '5. Con quién hablas si algo falla',
      },
      {
        tipo: 'p',
        texto:
          'En un marketplace como IAPyme hablas directamente con quien ha construido la solución, no con un centro de soporte genérico. Antes de pagar, manda un mensaje con una duda concreta y fíjate en cuánto tarda en responder — es la mejor señal de cómo te va a tratar después de la venta.',
      },
      {
        tipo: 'p',
        texto:
          'Ninguno de estos cinco puntos requiere saber programar. Requiere leer con calma antes de escribir "quiero información", que sigue siendo la mejor inversión de dos minutos que puedes hacer antes de automatizar algo en tu negocio.',
      },
    ],
  },
  {
    slug: 'senales-tu-negocio-necesita-bot-whatsapp',
    titulo: '5 señales de que tu negocio necesita un bot de WhatsApp',
    resumen:
      'Si respondes WhatsApp a las 11 de la noche o pierdes clientes en fin de semana, no es un problema de organización — es un problema que ya tiene solución.',
    fecha: '2026-08-05',
    categoria: 'Atención al cliente',
    contenido: [
      {
        tipo: 'p',
        texto:
          'La mayoría de pymes que atienden por WhatsApp llegan a la misma conclusión tarde: contratar a alguien solo para responder mensajes no sale a cuenta, pero no responder tampoco es una opción. Estas son las señales de que ya has cruzado esa línea.',
      },
      {
        tipo: 'h2',
        texto: '1. Contestas fuera de horario porque si no, pierdes al cliente',
      },
      {
        tipo: 'p',
        texto:
          'Si te sorprendes respondiendo WhatsApp a las 22:00 o en domingo porque "si no contesto ya, se va a la competencia", tu negocio ya está funcionando fuera de tu horario. La pregunta no es si necesitas ayuda, es si esa ayuda tiene que ser tuya.',
      },
      {
        tipo: 'h2',
        texto: '2. Las mismas cinco preguntas, cien veces',
      },
      {
        tipo: 'p',
        texto:
          'Horario, precio, si tenéis stock, dónde estáis, si aceptáis tal forma de pago. Si el 80% de tus mensajes son variaciones de las mismas preguntas, estás gastando tiempo humano en algo que no necesita criterio humano.',
      },
      {
        tipo: 'h2',
        texto: '3. Se te acumulan mensajes sin responder',
      },
      {
        tipo: 'p',
        texto:
          'No es pereza, es que un día tienes veinte cosas más urgentes. El problema es que quien pregunta no lo sabe, y para él, silencio es "no me han hecho caso". Cada mensaje sin responder a tiempo es, probablemente, una venta que se ha ido a otro sitio.',
      },
      {
        tipo: 'h2',
        texto: '4. Agendas citas a mano y a veces se te cruzan',
      },
      {
        tipo: 'p',
        texto:
          'Si confirmas citas por WhatsApp y llevas el calendario en tu cabeza o en un cuaderno, tarde o temprano vas a doblar una cita. No es un fallo tuyo, es que estás usando una herramienta de conversación para gestionar una agenda.',
      },
      {
        tipo: 'h2',
        texto: '5. Ya lo has intentado con respuestas automáticas y no bastan',
      },
      {
        tipo: 'p',
        texto:
          'El "mensaje de ausencia" de WhatsApp Business ayuda un rato, pero no agenda, no filtra spam y no distingue una pregunta real de un mensaje genérico. Si ya has probado ese primer escalón y se te ha quedado corto, el siguiente paso natural es algo que entienda lo que te preguntan, no solo que conteste que estás ocupado.',
      },
      {
        tipo: 'p',
        texto:
          'Si dos o más de estas señales te suenan, en la categoría de Atención al cliente del catálogo hay soluciones pensadas exactamente para esto — con precio claro y tiempo de instalación real, no promesas.',
      },
    ],
  },
];

export function getPostBlog(slug: string): PostBlog | null {
  return POSTS_BLOG.find((p) => p.slug === slug) ?? null;
}
