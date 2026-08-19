import type { KnowledgeDoc } from './types'

export const elegirAgenciaIa: KnowledgeDoc = {
  slug: 'como-elegir-una-agencia-de-ia',
  title: 'Cómo elegir una agencia de IA',
  summary:
    'Casi cualquiera puede llamarse hoy «consultor de IA». Esta guía recoge las preguntas que de verdad separan a quien sabe de quien vende humo, y qué deberías exigir antes de firmar nada.',
  category: 'Decisión',
  level: 'Iniciación',
  updated: '2026-08-19',
  intro: [
    {
      type: 'p',
      text: 'La barrera de entrada para llamarse «agencia de IA» es prácticamente cero: un dominio, una plantilla de web y un par de capturas de pantalla de ChatGPT bastan para montar una. Eso no significa que todas sean iguales, pero sí que el título por sí solo no dice nada.',
    },
    {
      type: 'p',
      text: 'Esta guía no compara proveedores concretos ni promete un método infalible. Reúne las preguntas que, en la práctica, distinguen a quien sabe de qué habla de quien repite lo que ha leído esta semana.',
    },
    {
      type: 'quote',
      text: 'Si en la primera reunión ya te están hablando de la herramienta, y no de tu problema, esa reunión ha empezado al revés.',
    },
  ],
  chapters: [
    {
      id: 'antes-de-mirar-proveedores',
      title: '1. Antes de mirar proveedores',
      blocks: [
        {
          type: 'p',
          text: 'El error más común no está en elegir mal, sino en empezar a elegir demasiado pronto. Buscar «agencia de IA» sin tener claro qué problema quieres resolver te deja a merced de quien mejor venda, no de quien mejor resuelva.',
        },
        {
          type: 'p',
          text: 'Antes de contactar con nadie, conviene poder responder a tres preguntas propias. No hace falta tener la solución, sólo el problema bien planteado:',
        },
        {
          type: 'ul',
          items: [
            '¿Qué tarea o proceso concreto te está costando tiempo, dinero o calidad?',
            '¿Por qué crees que la IA (y no otra cosa) es la respuesta?',
            '¿Cómo sabrás, dentro de tres meses, si funcionó?',
          ],
        },
        {
          type: 'callout',
          label: 'Señal de alarma',
          variant: 'warn',
          text: 'Si un proveedor te propone una solución antes de haberte hecho estas preguntas él mismo, no ha diagnosticado nada: ha aplicado una plantilla.',
        },
      ],
    },
    {
      id: 'preguntas-que-hacer',
      title: '2. Las preguntas que hay que hacer',
      blocks: [
        {
          type: 'p',
          text: 'Una primera conversación con una agencia debería parecerse más a una entrevista que a una demostración de producto. Estas son las preguntas que más información dan, y por qué importan.',
        },
        {
          type: 'h3',
          text: '«¿Cómo vais a medir si esto funciona?»',
        },
        {
          type: 'p',
          text: 'Si la respuesta es vaga —«lo notaréis», «ganaréis eficiencia»— no hay compromiso real con el resultado. Una respuesta seria define una métrica concreta antes de empezar, no después.',
        },
        {
          type: 'h3',
          text: '«¿Qué pasa si esto no funciona?»',
        },
        {
          type: 'p',
          text: 'Quien confía en su propio trabajo no tiene problema en hablar de qué ocurre si el resultado no llega. Quien evita la pregunta suele estar más preocupado por cerrar el contrato que por el resultado.',
        },
        {
          type: 'h3',
          text: '«¿Quedo dependiendo de vosotros para siempre?»',
        },
        {
          type: 'p',
          text: 'Una buena entrega incluye documentación y, si hace falta, formación para que el cliente entienda y pueda mantener lo construido. Si la respuesta implica que sin ellos «se para todo», el modelo de negocio depende de que nunca puedas irte.',
        },
        {
          type: 'h3',
          text: '«¿Podéis enseñarme un caso parecido al mío?»',
        },
        {
          type: 'p',
          text: 'No hace falta un caso idéntico, pero sí una explicación de cómo razonaron un problema similar. Si sólo hay generalidades («hemos ayudado a muchas empresas»), probablemente no hay mucho detrás de esa frase.',
        },
      ],
    },
    {
      id: 'senales-de-alarma',
      title: '3. Señales de alarma',
      blocks: [
        {
          type: 'p',
          text: 'Hay patrones que se repiten en propuestas poco serias, casi independientemente del proveedor. Ninguno es definitivo por sí solo, pero cuantos más aparezcan juntos, más motivos para desconfiar.',
        },
        {
          type: 'ul',
          items: [
            'Cifras de ahorro o de retorno prometidas antes de conocer tu proceso real.',
            'Presión para firmar ya, con descuentos que caducan «esta semana».',
            'Contratos largos (un año o más) sin ninguna revisión intermedia.',
            'Todo el discurso gira en torno a una herramienta o marca concreta, no a tu problema.',
            'No pueden explicar, en una frase, qué harán exactamente por ti.',
            'Evitan hablar de límites: para ellos, la IA lo puede todo.',
          ],
        },
        {
          type: 'example',
          label: 'Ejemplo',
          text: 'Una propuesta que empieza con «vamos a automatizar tu atención al cliente con IA» y termina ahí, sin haber preguntado antes cuántas consultas recibís, de qué tipo, o quién las atiende hoy, no es una propuesta: es un titular.',
        },
      ],
    },
    {
      id: 'el-precio',
      title: '4. Sobre el precio',
      blocks: [
        {
          type: 'p',
          text: 'No existe un precio de mercado fijo para «implementar IA», porque no es un producto único: depende del alcance, de si hay que integrar con lo que ya usas, de si hace falta desarrollo a medida o basta con configurar herramientas existentes, y de cuánto acompañamiento incluye.',
        },
        {
          type: 'p',
          text: 'Lo que sí puedes exigir es que el presupuesto explique de dónde sale cada partida, y que distinga entre el trabajo puntual (analizar, construir, poner en marcha) y el coste recurrente (mantenimiento, licencias de terceros, soporte). Un número cerrado sin ese desglose es difícil de comparar y fácil de inflar.',
        },
        {
          type: 'callout',
          label: 'Pregunta útil',
          text: '«¿Qué parte de esto es vuestro trabajo y qué parte es una licencia de un tercero que me estáis repercutiendo?» Es una pregunta incómoda de hacer y muy reveladora de escuchar.',
        },
      ],
    },
    {
      id: 'que-deberias-tener-al-final',
      title: '5. Qué deberías tener al terminar',
      blocks: [
        {
          type: 'p',
          text: 'Al margen de la herramienta o el proceso concreto, un trabajo bien hecho deja siempre lo mismo detrás:',
        },
        {
          type: 'ol',
          items: [
            'Un diagnóstico por escrito de la situación de partida, no sólo la solución.',
            'Documentación de lo que se ha construido, en un lenguaje que entiendas sin ser técnico.',
            'La métrica acordada al principio, con el dato de antes y de después.',
            'Claridad sobre qué mantenimiento hace falta y quién lo asume.',
            'La posibilidad real de continuar sin ese proveedor, aunque decidas seguir con ellos.',
          ],
        },
        {
          type: 'p',
          text: 'Si al terminar el trabajo no tienes ninguna de estas cinco cosas, es difícil defender que ha sido una buena inversión, por muy bien que haya ido el resultado a corto plazo.',
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
        'Ten claro tu problema antes de hablar con nadie, no dejes que te lo definan.',
        'Haz las preguntas incómodas: cómo se mide, qué pasa si falla, de quién dependes después.',
        'Desconfía de cifras prometidas antes de conocer tu caso, y de la prisa por firmar.',
        'Exige que el presupuesto se desglose, no un número cerrado sin explicación.',
        'Al terminar, deberías poder explicar tú mismo lo que se ha hecho y por qué.',
      ],
    },
    {
      type: 'p',
      text: 'Si quieres aplicar esto a tu propio caso antes de hablar con nadie, el diagnóstico orientativo de esta web te ayuda a ordenar la situación de partida en unos minutos, sin compromiso.',
    },
  ],
}
