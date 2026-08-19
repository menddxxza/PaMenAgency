import type { KnowledgeDoc } from './types'

export const cuantoCuestaIaPyme: KnowledgeDoc = {
  slug: 'cuanto-cuesta-implementar-ia-en-una-pyme',
  title: 'Cuánto cuesta implementar IA en una PYME',
  summary:
    'No hay una tarifa única para «meter IA» en un negocio: depende de qué se haga exactamente. Esta guía explica los factores reales que mueven el precio, para que puedas leer cualquier presupuesto con criterio.',
  category: 'Decisión',
  level: 'Iniciación',
  updated: '2026-08-19',
  intro: [
    {
      type: 'p',
      text: 'Quien busca «precio implementar IA en mi empresa» suele encontrar dos tipos de respuesta: cifras enormes que asustan, o cifras ridículamente bajas que prometen demasiado. Ninguna de las dos ayuda, porque «implementar IA» no es un producto con precio de catálogo.',
    },
    {
      type: 'p',
      text: 'Esta guía no da una cifra —sería inventar un dato que no existe— sino los factores que de verdad mueven el coste, para que sepas qué preguntar y puedas comparar presupuestos con criterio en lugar de por instinto.',
    },
    {
      type: 'quote',
      text: 'Preguntar «¿cuánto cuesta la IA?» es como preguntar «¿cuánto cuesta una obra?». Depende enteramente de qué se construye.',
    },
  ],
  chapters: [
    {
      id: 'por-que-no-hay-tarifa-fija',
      title: '1. Por qué no hay una tarifa fija',
      blocks: [
        {
          type: 'p',
          text: '«IA» describe un campo entero, no una tarea. Configurar un asistente que responde preguntas frecuentes con información que ya tienes escrita no se parece en nada, en esfuerzo ni en coste, a integrar varios sistemas para que se pasen datos automáticamente entre sí.',
        },
        {
          type: 'p',
          text: 'Cualquier cifra que veas publicada sin conocer tu caso concreto es, como mucho, una media de proyectos que no son el tuyo. Sirve para hacerse una idea de rango, no para presupuestar nada.',
        },
      ],
    },
    {
      id: 'los-factores-que-mueven-el-precio',
      title: '2. Los factores que de verdad mueven el precio',
      blocks: [
        {
          type: 'p',
          text: 'De mayor a menor impacto habitual en el coste final:',
        },
        {
          type: 'h3',
          text: 'Si hay que integrar con lo que ya usas',
        },
        {
          type: 'p',
          text: 'Configurar una herramienta que funciona sola es rápido. Conectarla con tu CRM, tu facturación o tu correo —para que la información se mueva sin que nadie la copie a mano— multiplica el trabajo, porque cada sistema tiene su propia forma de comunicarse (o ninguna).',
        },
        {
          type: 'h3',
          text: 'Si hace falta desarrollo a medida o basta con configurar',
        },
        {
          type: 'p',
          text: 'Hay una diferencia enorme entre usar una herramienta ya existente con la configuración adecuada, y construir algo específico para tu proceso porque nada del mercado encaja. Lo segundo es más caro casi siempre, y no siempre hace falta: muchas veces la opción configurada es suficiente.',
        },
        {
          type: 'h3',
          text: 'Cuánto acompañamiento incluye',
        },
        {
          type: 'p',
          text: 'Un presupuesto puede cubrir sólo la puesta en marcha, o incluir formación al equipo, documentación y un periodo de ajuste tras el lanzamiento. Dos propuestas con la misma «solución técnica» pueden tener precios muy distintos por esto, y no siempre se explica con claridad.',
        },
        {
          type: 'h3',
          text: 'El volumen y la complejidad del caso',
        },
        {
          type: 'p',
          text: 'No cuesta lo mismo clasificar veinte correos al día que dos mil, ni responder preguntas simples que casos que requieren contexto largo y variado. El volumen afecta tanto al diseño de la solución como, después, al coste recurrente de usarla.',
        },
        {
          type: 'callout',
          label: 'Factor que casi nadie menciona',
          text: 'El coste no termina en la puesta en marcha. Casi toda automatización necesita mantenimiento: ajustar cuando cambia un proceso, revisar cuando algo falla, actualizar cuando cambia la herramienta que usas por debajo.',
        },
      ],
    },
    {
      id: 'costes-puntuales-y-recurrentes',
      title: '3. Coste puntual vs. coste recurrente',
      blocks: [
        {
          type: 'p',
          text: 'Conviene separar mentalmente dos partidas que casi siempre se mezclan en un único número:',
        },
        {
          type: 'ul',
          items: [
            '**Coste puntual**: analizar el proceso, construir o configurar la solución, ponerla en marcha, formar al equipo.',
            '**Coste recurrente**: licencias de las herramientas que se usan por debajo (muchas cobran por uso o por mes), mantenimiento y soporte continuado.',
          ],
        },
        {
          type: 'p',
          text: 'Un presupuesto que sólo muestra un número sin esta separación es difícil de comparar con otro, y fácil de inflar metiendo margen en una partida que debería ser prácticamente el coste real de un tercero.',
        },
        {
          type: 'example',
          label: 'Ejemplo',
          text: 'Un asistente de IA puede tener un coste de puesta en marcha razonable y, después, un coste mensual que depende de cuántas conversaciones atienda. Ese segundo número crece con el uso, y conviene saberlo desde el principio, no descubrirlo en la primera factura alta.',
        },
      ],
    },
    {
      id: 'como-mantener-el-coste-bajo-control',
      title: '4. Cómo mantener el coste bajo control',
      blocks: [
        {
          type: 'p',
          text: 'La forma más fiable de no gastar de más no es negociar mejor el precio: es acotar bien el alcance antes de empezar.',
        },
        {
          type: 'ol',
          items: [
            'Empieza por una sola tarea concreta, no por «automatizar el departamento entero».',
            'Pide que el presupuesto separe puesta en marcha de coste recurrente.',
            'Pregunta qué pasa si el volumen de uso crece: ¿el coste sube de forma lineal, o hay saltos de precio?',
            'Antes de ampliar el alcance, mide si la primera parte funcionó de verdad.',
          ],
        },
        {
          type: 'p',
          text: 'Ampliar sobre algo que ya ha demostrado funcionar es una decisión de bajo riesgo. Empezar grande, sin haber probado nada, es donde más dinero se pierde en proyectos de IA que acaban a medias.',
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
        'No existe una tarifa única: el precio depende del alcance, la integración y el acompañamiento incluido.',
        'Distingue siempre entre coste puntual y coste recurrente antes de comparar propuestas.',
        'Desconfía de cifras cerradas sin desglose, y de cifras muy bajas sin explicación de qué excluyen.',
        'Empieza acotado, mide, y sólo entonces amplía.',
      ],
    },
    {
      type: 'p',
      text: 'Si quieres una estimación ajustada a tu caso concreto, la única forma honesta de darla es conociendo tu proceso real, no antes.',
    },
  ],
}
