import type { KnowledgeDoc } from './types'

/**
 * Guía para quien tiene que justificar la inversión, no para quien va a
 * usar la herramienta. De ahí la categoría «Dirección».
 *
 * Se apoya en la misma aritmética que la calculadora de /calculadora, y
 * mantiene su misma regla: ningún porcentaje de mejora inventado.
 */
export const calcularRetornoIa: KnowledgeDoc = {
  slug: 'como-calcular-el-retorno-de-una-inversion-en-ia',
  title: 'Cómo calcular el retorno de una inversión en IA',
  summary:
    'Qué se puede medir de verdad antes de automatizar algo, qué costes se olvidan casi siempre y por qué la mayoría de cálculos de retorno que circulan no valen nada.',
  category: 'Dirección',
  level: 'Intermedio',
  updated: '2026-09-09',
  intro: [
    {
      type: 'p',
      text: 'Casi todas las cifras de retorno que circulan sobre IA tienen el mismo problema: parten de un porcentaje de mejora que alguien se ha inventado. «Reduce un 40 % el tiempo de gestión» suena convincente hasta que preguntas de dónde sale ese 40 %, y resulta que sale de un caso ajeno, de otro sector y de otro tamaño de empresa.',
    },
    {
      type: 'p',
      text: 'Esta guía no te va a dar un porcentaje. Te va a dar la forma de calcular el tuyo, que es lo único que sirve para decidir.',
    },
  ],
  chapters: [
    {
      id: 'el-punto-de-partida',
      title: 'Primero: lo que ya te cuesta',
      blocks: [
        {
          type: 'p',
          text: 'El retorno de una automatización se mide contra un punto de partida. Si no sabes lo que un proceso te cuesta hoy, cualquier mejora será una sensación, no un dato. Y la sensación se desvanece a los tres meses, justo cuando toca decidir si se sigue pagando por ello.',
        },
        {
          type: 'p',
          text: 'El cálculo base es incómodamente simple: **personas × horas dedicadas × coste por hora**. Lo difícil no es la fórmula, es conseguir los tres números sin engañarse.',
        },
        { type: 'h3', text: 'Las horas' },
        {
          type: 'p',
          text: 'Nadie recuerda bien cuánto tiempo dedica a una tarea repetitiva, porque se hace en trozos pequeños repartidos por el día. Preguntar «¿cuánto tardas en esto?» da respuestas optimistas de forma sistemática. Anotarlo durante una semana da respuestas incómodas y reales.',
        },
        { type: 'h3', text: 'El coste por hora' },
        {
          type: 'p',
          text: 'No es el salario neto. Es lo que le cuesta a la empresa esa hora: salario bruto, seguridad social, y el resto de costes asociados al puesto. Usar el neto puede subestimar el coste real casi a la mitad.',
        },
        {
          type: 'callout',
          label: 'La interrupción también cuenta',
          text: 'Responder una consulta de dos minutos rara vez cuesta dos minutos: cuesta los dos minutos más el tiempo de volver a donde estabas. Si el proceso interrumpe otro trabajo, el coste real es mayor que el cronometrado.',
        },
      ],
    },
    {
      id: 'coste-real',
      title: 'Segundo: lo que cuesta la solución (entero)',
      blocks: [
        {
          type: 'p',
          text: 'Aquí es donde la mayoría de cálculos se rompen. Se compara el coste actual con el precio de la herramienta, y se ignora todo lo demás. Lo demás suele ser la mitad del proyecto.',
        },
        {
          type: 'ul',
          items: [
            'La implantación: alguien tiene que conectar, configurar y probar. Se paga una vez, pero se paga.',
            'Las licencias o el consumo mensual, que crecen con el uso.',
            'El tiempo de tu equipo durante la puesta en marcha: reuniones, pruebas, correcciones.',
            'La revisión humana que quede: casi ninguna automatización seria queda sin supervisión.',
            'El mantenimiento: cuando cambie tu proveedor, tu programa de gestión o tu forma de trabajar, esto habrá que tocarlo.',
          ],
        },
        {
          type: 'quote',
          text: 'Una automatización sin coste de mantenimiento previsto no es más barata: simplemente todavía no ha llegado la factura.',
        },
      ],
    },
    {
      id: 'que-parte-es-automatizable',
      title: 'Tercero: qué parte es automatizable de verdad',
      blocks: [
        {
          type: 'p',
          text: 'Este es el número que nadie puede darte sin mirar tu proceso, y el motivo por el que esta guía no incluye porcentajes. Depende de cuántas excepciones tenga, de cuántos formatos distintos entren y de cuánto criterio haga falta en cada paso.',
        },
        {
          type: 'p',
          text: 'Una regla que funciona razonablemente bien: **cuenta cuántas veces de cada diez el proceso se resuelve exactamente igual**. Ese es tu terreno automatizable. Las otras seguirán pasando por una persona, y está bien que así sea.',
        },
        {
          type: 'example',
          label: 'Ejemplo',
          text: 'De cada 100 facturas, 70 vienen de cinco proveedores habituales con el mismo formato. Esas 70 son el objetivo realista. Las 30 restantes —formatos raros, incidencias, casos especiales— seguirán siendo manuales, y perseguirlas suele costar más de lo que ahorran.',
        },
        {
          type: 'callout',
          label: 'Empieza por ahí, no por lo difícil',
          variant: 'warn',
          text: 'El error más caro es empezar por el caso más complicado porque es el que más duele. Si lo complicado falla, el proyecto entero pierde credibilidad interna antes de haber demostrado nada.',
        },
      ],
    },
    {
      id: 'lo-que-no-se-mide-en-dinero',
      title: 'Lo que no cabe en la hoja de cálculo',
      blocks: [
        {
          type: 'p',
          text: 'Hay efectos reales que no se traducen bien a euros, y fingir que sí acaba en cifras infladas que nadie se cree. Es más honesto listarlos aparte:',
        },
        {
          type: 'ul',
          items: [
            'Errores evitados: un dato mal transcrito puede costar mucho más que el tiempo de transcribirlo, pero no sabes cuántos habrías cometido.',
            'Capacidad de absorber picos sin contratar.',
            'Que una baja o unas vacaciones dejen de convertirse en un atasco.',
            'Trabajo que nadie quiere hacer y que desgasta al equipo.',
            'Tiempo de respuesta al cliente, que influye en ventas de forma difícil de aislar.',
          ],
        },
        {
          type: 'p',
          text: 'Estos argumentos son legítimos y a veces son el motivo principal. Sólo hay que presentarlos por lo que son —beneficios cualitativos— y no disfrazarlos de retorno financiero.',
        },
      ],
    },
    {
      id: 'cuando-decir-que-no',
      title: 'Cuándo el número dice que no',
      blocks: [
        {
          type: 'p',
          text: 'Si el cálculo sale ajustado, lo más rentable es no hacerlo. Un proyecto que apenas se paga a sí mismo consume además atención, paciencia interna y credibilidad para el siguiente.',
        },
        {
          type: 'p',
          text: 'Señales de que el número no va a salir:',
        },
        {
          type: 'ol',
          items: [
            'El proceso cambia cada pocos meses: lo automatizado quedará obsoleto antes de amortizarse.',
            'El volumen es bajo: automatizar diez casos al mes rara vez compensa el trabajo de montarlo.',
            'Cada caso es distinto: si no hay repetición, no hay nada que automatizar.',
            'Los datos están desordenados o incompletos: primero hay que arreglar eso, y ese es otro proyecto con su propio cálculo.',
          ],
        },
        {
          type: 'quote',
          text: 'Decidir no automatizar algo también es un resultado del análisis, y bastante más barato que descubrirlo a mitad de la implantación.',
        },
      ],
    },
  ],
  conclusion: [
    {
      type: 'p',
      text: 'Resumiendo el método: mide lo que te cuesta hoy, suma **todo** lo que cuesta la solución, estima con honestidad qué proporción del proceso se repite igual, y aparta en una lista separada los beneficios que no se pueden convertir en euros. Si después de eso el número sigue saliendo, tienes una decisión defendible delante de quien sea.',
    },
    {
      type: 'callout',
      label: 'Para empezar por el primer número',
      text: 'La calculadora de esta web hace exactamente el cálculo del primer capítulo con tus datos: personas, horas, coste y consultas repetidas. No estima ahorros —eso exige mirar el proceso— pero te da el punto de partida contra el que medir cualquier propuesta, venga de quien venga.',
    },
  ],
}
