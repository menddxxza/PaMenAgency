import type { KnowledgeDoc } from './types'

export const ventajaReal: KnowledgeDoc = {
  slug: 'convertir-la-ia-en-ventaja-real',
  title: 'Cómo convertir la IA en una ventaja real',
  summary:
    'La diferencia entre usar herramientas de IA y obtener una ventaja con ellas no está en la tecnología, sino en el método. Esta guía recorre ese método paso a paso.',
  category: 'Fundamentos',
  level: 'Iniciación',
  updated: '2026-08-18',
  intro: [
    {
      type: 'p',
      text: 'Casi todo el mundo ha probado ya una herramienta de Inteligencia Artificial. Muy poca gente ha obtenido una ventaja real con ella. Esa distancia no la explica la tecnología —la misma herramienta está disponible para todos— sino lo que se hace con ella.',
    },
    {
      type: 'p',
      text: 'Esta guía describe el camino que separa «sé que existe la IA» de «sé exactamente cómo usarla para mejorar mi situación». No requiere conocimientos técnicos y no vende ninguna herramienta concreta.',
    },
    {
      type: 'quote',
      text: 'Una herramienta que todo el mundo tiene no es una ventaja. La ventaja está en el criterio con el que se usa.',
    },
  ],
  chapters: [
    {
      id: 'la-trampa-de-la-herramienta',
      title: '1. La trampa de la herramienta',
      blocks: [
        {
          type: 'p',
          text: 'El error más repetido consiste en empezar por la herramienta. Alguien lee que una IA hace algo impresionante, se suscribe, la prueba dos semanas y la abandona. No porque la herramienta fuera mala, sino porque nunca hubo un problema concreto que resolver.',
        },
        {
          type: 'p',
          text: 'Cuando se empieza por la herramienta, la pregunta que uno se hace es **«¿para qué puedo usar esto?»**. Es una pregunta condenada: obliga a inventar usos. La pregunta que funciona es la inversa: **«¿qué me está costando tiempo o dinero, y hay algo aquí que ayude?»**.',
        },
        {
          type: 'callout',
          label: 'Señal de alarma',
          variant: 'warn',
          text: 'Si tienes tres suscripciones de IA activas y no sabrías decir qué tarea concreta resuelve cada una, no tienes un problema de herramientas: tienes un problema de método.',
        },
        {
          type: 'p',
          text: 'Hay una segunda versión de la trampa, más sutil: usar la IA sólo para generar texto. Es lo primero que todo el mundo prueba y donde muchos se quedan. Redactar es una fracción mínima de lo que puede aportar; clasificar, extraer, comparar, resumir, priorizar y conectar información suelen valer bastante más.',
        },
      ],
    },
    {
      id: 'empezar-por-el-problema',
      title: '2. Empezar por el problema',
      blocks: [
        {
          type: 'p',
          text: 'El punto de partida no es tecnológico. Es una lista honesta de lo que te consume tiempo, de lo que se te escapa y de lo que haces peor de lo que te gustaría.',
        },
        {
          type: 'h3',
          text: 'El ejercicio de la semana',
        },
        {
          type: 'p',
          text: 'Durante siete días, anota cada vez que hagas algo por segunda vez. No hace falta un sistema elaborado: una nota en el móvil basta. Al final de la semana tendrás delante lo que ninguna herramienta puede darte, que es el mapa real de tu tiempo.',
        },
        {
          type: 'ol',
          items: [
            'Apunta la tarea, aunque parezca insignificante.',
            'Anota cuántas veces la has hecho y cuánto te ha llevado cada una.',
            'Marca si los pasos son siempre los mismos o si cambian según el caso.',
            'Marca si requiere una decisión tuya o si sigue reglas fijas.',
          ],
        },
        {
          type: 'p',
          text: 'Las tareas frecuentes, con pasos estables y sin decisión de fondo son las candidatas. Las que exigen criterio profesional, contexto o responsabilidad no lo son, por muy repetitivas que parezcan.',
        },
        {
          type: 'example',
          label: 'Ejemplo',
          text: 'Responder «¿tenéis cita mañana?» veinte veces al día es candidato. Decidir qué presupuesto se ajusta a un cliente difícil no lo es, aunque lo hagas cada semana.',
        },
      ],
    },
    {
      id: 'analizar-antes-de-automatizar',
      title: '3. Analizar antes de automatizar',
      blocks: [
        {
          type: 'p',
          text: 'Antes de automatizar cualquier cosa hay que descomponerla. Escribir los pasos de un proceso que llevas años haciendo produce un efecto casi cómico: aparecen pasos que no aportan nada y que sólo existen porque un día alguien los hizo así.',
        },
        {
          type: 'callout',
          label: 'Regla',
          text: 'Automatizar un proceso defectuoso no lo arregla: lo repite más rápido y en más sitios. Primero se simplifica, después se automatiza.',
        },
        {
          type: 'p',
          text: 'En muchos casos, la simplificación por sí sola ya devuelve la mitad del tiempo, y lo hace sin gastar un euro ni depender de ningún proveedor. Eso también es un resultado, y conviene reconocerlo antes de seguir.',
        },
        {
          type: 'h3',
          text: 'Qué mirar en cada paso',
        },
        {
          type: 'ul',
          items: [
            '¿Este paso existe porque alguien lo necesita, o porque siempre se ha hecho?',
            '¿La información que se maneja aquí ya está en otro sitio?',
            '¿Qué ocurre si este paso sale mal? ¿Quién se entera?',
            '¿Hay una decisión real o sólo se aplican reglas?',
          ],
        },
      ],
    },
    {
      id: 'donde-entra-la-ia',
      title: '4. Dónde entra la IA (y dónde no)',
      blocks: [
        {
          type: 'p',
          text: 'Una vez descompuesto el proceso, la IA no entra en todo: entra en los pasos donde hace falta interpretar lenguaje o información poco estructurada. El resto del proceso —mover datos, avisar, guardar, programar— es automatización clásica, y suele ser más fiable y más barata.',
        },
        {
          type: 'h3',
          text: 'Hace bien',
        },
        {
          type: 'ul',
          items: [
            'Convertir texto desordenado en información estructurada.',
            'Clasificar y priorizar grandes cantidades de entradas.',
            'Resumir manteniendo lo esencial.',
            'Redactar borradores a partir de un contexto que tú aportas.',
            'Extraer datos concretos de documentos.',
            'Traducir entre formatos, tonos y niveles de detalle.',
          ],
        },
        {
          type: 'h3',
          text: 'Hace mal',
        },
        {
          type: 'ul',
          items: [
            'Cualquier cosa que exija saber si algo es verdad.',
            'Decisiones con consecuencias que no puede evaluar.',
            'Cálculos y operaciones donde un error no se detecta a simple vista.',
            'Tareas que dependen de contexto que no le has dado.',
            'Todo lo que requiera responsabilidad ante un tercero.',
          ],
        },
        {
          type: 'quote',
          text: 'La IA es excelente convirtiendo información de una forma a otra. Es mala decidiendo si esa información era correcta.',
        },
      ],
    },
    {
      id: 'medir',
      title: '5. Medir, o no habrá servido de nada',
      blocks: [
        {
          type: 'p',
          text: 'La mayoría de implantaciones no fracasan: simplemente nadie sabe si funcionaron. Sin una medida acordada antes de empezar, a los tres meses la conversación se reduce a impresiones, y las impresiones siempre favorecen a lo que se acaba de comprar.',
        },
        {
          type: 'p',
          text: 'La medida no tiene que ser sofisticada. Tiene que ser concreta y anterior a la implantación.',
        },
        {
          type: 'ul',
          items: [
            'Horas semanales dedicadas a esa tarea, antes y después.',
            'Número de veces que hubo que corregir el resultado a mano.',
            'Tiempo desde que entra una consulta hasta que se responde.',
            'Cuántas veces falló el proceso y cuánto costó arreglarlo.',
          ],
        },
        {
          type: 'callout',
          label: 'Importante',
          variant: 'warn',
          text: 'Cuenta también el tiempo de mantenimiento y de revisión. Una automatización que ahorra cuatro horas pero exige tres de supervisión no está ahorrando cuatro horas.',
        },
      ],
    },
    {
      id: 'de-mejora-a-ventaja',
      title: '6. De mejora a ventaja',
      blocks: [
        {
          type: 'p',
          text: 'Una mejora aislada es una mejora. La ventaja aparece cuando se acumulan y cuando lo aprendido se puede repetir sobre otro proceso sin empezar de cero.',
        },
        {
          type: 'p',
          text: 'Esa acumulación tiene tres formas de manifestarse, y ninguna consiste en tener más herramientas que el vecino:',
        },
        {
          type: 'ol',
          items: [
            '**Coste**: haces lo mismo con menos tiempo, lo que amplía margen sin subir precios.',
            '**Velocidad**: respondes, entregas o produces antes que quien no lo ha hecho.',
            '**Alcance**: puedes ofrecer algo que antes no era rentable por el tiempo que exigía.',
          ],
        },
        {
          type: 'p',
          text: 'La tercera es la más interesante y la que menos se explora. No consiste en hacer más rápido lo de siempre, sino en que aparezcan servicios que antes no salían a cuenta. Ahí es donde la IA deja de ser una herramienta de eficiencia y empieza a ser una decisión de negocio.',
        },
        {
          type: 'divider',
        },
        {
          type: 'p',
          text: 'Conviene cerrar con una advertencia. Toda ventaja construida sobre una herramienta que cualquiera puede contratar es temporal por definición. Lo que no caduca es el método: saber mirar un proceso, descomponerlo, decidir qué merece automatizarse y comprobar si funcionó. Eso se aplica a la siguiente herramienta, y a la siguiente.',
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
        'Empieza por un problema tuyo, no por una herramienta.',
        'Descompón el proceso y elimina lo que sobra antes de automatizar.',
        'Mete IA sólo donde hay lenguaje o información desordenada.',
        'Define cómo medirás el resultado antes de implantar nada.',
        'Extiende sólo lo que ya haya demostrado funcionar.',
      ],
    },
    {
      type: 'p',
      text: 'Si después de leer esto sabes cuál es tu primera tarea candidata, la guía ha cumplido su función. Ese es el punto donde empieza el trabajo de verdad.',
    },
  ],
}
