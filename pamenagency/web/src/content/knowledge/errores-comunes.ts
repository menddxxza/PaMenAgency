import type { KnowledgeDoc } from './types'

export const erroresComunes: KnowledgeDoc = {
  slug: 'errores-comunes-al-usar-ia',
  title: 'Errores comunes al utilizar IA',
  summary:
    'Los fallos que se repiten en casi todo el mundo que empieza con IA, por qué ocurren y cómo corregirlos sin cambiar de herramienta.',
  category: 'Práctica',
  level: 'Iniciación',
  updated: '2026-08-18',
  intro: [
    {
      type: 'p',
      text: 'La mayoría de la gente que dice que la IA «no le sirve para gran cosa» está cometiendo dos o tres de estos errores. Ninguno se arregla cambiando de herramienta; todos se arreglan cambiando la forma de trabajar con ella.',
    },
  ],
  chapters: [
    {
      id: 'pedir-sin-contexto',
      title: '1. Pedir sin dar contexto',
      blocks: [
        {
          type: 'p',
          text: 'Es el error número uno y el que más frustración genera. Una petición de una línea produce una respuesta genérica, porque no hay nada en ella que la distinga de la misma petición hecha por otras cien mil personas.',
        },
        {
          type: 'example',
          label: 'En vez de',
          text: '«Escríbeme un correo para un cliente.»',
        },
        {
          type: 'example',
          label: 'Prueba con',
          text: '«Soy dueño de un taller mecánico. Un cliente dejó su coche hace dos semanas y no responde a las llamadas. Necesito un correo breve, cordial pero firme, avisando de que a partir del día 30 se aplicará coste de estancia. Tono cercano, sin sonar a burocracia.»',
        },
        {
          type: 'p',
          text: 'La segunda petición tarda treinta segundos más en escribirse y ahorra cuatro intentos.',
        },
      ],
    },
    {
      id: 'aceptar-la-primera',
      title: '2. Aceptar la primera respuesta',
      blocks: [
        {
          type: 'p',
          text: 'La primera respuesta es un borrador, no un entregable. Quien obtiene buenos resultados casi nunca los obtiene al primer intento: los obtiene corrigiendo.',
        },
        {
          type: 'ul',
          items: [
            '«Demasiado largo, redúcelo a la mitad sin perder el segundo punto.»',
            '«El tono suena a folleto. Escríbelo como se lo explicarías a un conocido.»',
            '«Eso no encaja en mi caso porque trabajo solo. Rehazlo con eso en cuenta.»',
          ],
        },
        {
          type: 'callout',
          label: 'Cambio de mentalidad',
          text: 'No estás pidiendo un resultado: estás dirigiendo un proceso. Las tres primeras respuestas son material de trabajo.',
        },
      ],
    },
    {
      id: 'usarla-solo-para-escribir',
      title: '3. Usarla sólo para escribir texto',
      blocks: [
        {
          type: 'p',
          text: 'Redactar es lo primero que todo el mundo prueba, y donde muchos se quedan. Es probablemente el uso con menos recorrido de todos los posibles.',
        },
        {
          type: 'ul',
          items: [
            'Extraer datos concretos de un documento largo.',
            'Clasificar cien entradas según criterios que tú defines.',
            'Comparar dos versiones y señalar exactamente qué cambió.',
            'Convertir notas desordenadas en una estructura utilizable.',
            'Detectar qué falta en un texto antes de enviarlo.',
            'Preparar preguntas para una reunión a partir de un expediente.',
          ],
        },
      ],
    },
    {
      id: 'no-verificar',
      title: '4. No verificar nada',
      blocks: [
        {
          type: 'p',
          text: 'Se explica en detalle en «Las grietas de la IA», pero merece repetirse aquí: la seguridad del tono no tiene ninguna relación con la exactitud del contenido.',
        },
        {
          type: 'callout',
          label: 'Criterio simple',
          variant: 'warn',
          text: 'Si el dato tiene consecuencias —lo vas a publicar, enviar a un cliente o usar para decidir—, verifícalo en la fuente. Si no las tiene, sigue adelante.',
        },
      ],
    },
    {
      id: 'no-guardar-lo-que-funciona',
      title: '5. No guardar lo que funciona',
      blocks: [
        {
          type: 'p',
          text: 'Después de cinco intentos consigues exactamente lo que querías. Cierras la ventana. La semana siguiente empiezas de cero.',
        },
        {
          type: 'p',
          text: 'Todo lo que vayas a repetir merece guardarse: la instrucción que funcionó, el contexto que hizo falta y el formato de salida. Un archivo con diez plantillas propias vale más que cualquier lista de «los 500 mejores prompts».',
        },
      ],
    },
    {
      id: 'demasiadas-herramientas',
      title: '6. Acumular herramientas',
      blocks: [
        {
          type: 'p',
          text: 'Probar cinco herramientas a la vez no acelera el aprendizaje: lo impide. Ninguna llega a dominarse y el criterio para compararlas nunca se forma.',
        },
        {
          type: 'callout',
          label: 'Qué hacer',
          text: 'Una herramienta, un mes, tareas reales. Se cambia cuando se le encuentra un límite concreto, no cuando aparece algo nuevo en las noticias.',
        },
      ],
    },
    {
      id: 'automatizar-demasiado-pronto',
      title: '7. Automatizar demasiado pronto',
      blocks: [
        {
          type: 'p',
          text: 'Automatizar una tarea que aún no dominas a mano es la vía más rápida a un sistema que produce trabajo defectuoso en volumen.',
        },
        {
          type: 'ol',
          items: [
            'Haz la tarea a mano con ayuda de la IA durante unas semanas.',
            'Anota qué se repite exactamente igual y qué cambia cada vez.',
            'Automatiza sólo la parte estable.',
            'Deja un punto de revisión humana antes de que el resultado salga fuera.',
          ],
        },
      ],
    },
    {
      id: 'subir-lo-que-no-se-debe',
      title: '8. Subir información que no debería salir',
      blocks: [
        {
          type: 'p',
          text: 'Ocurre sin mala intención y casi siempre por comodidad: pegar un contrato entero para pedir un resumen, o un listado de clientes para ordenarlo alfabéticamente.',
        },
        {
          type: 'p',
          text: 'Muchas veces basta con anonimizar: sustituir nombres y datos identificativos por marcadores antes de pegar el texto. El resultado es el mismo y el riesgo desaparece.',
        },
      ],
    },
  ],
  conclusion: [
    {
      type: 'h3',
      text: 'Los ocho, en una línea cada uno',
    },
    {
      type: 'ol',
      items: [
        'Da contexto antes de pedir.',
        'Trata la primera respuesta como un borrador.',
        'No la uses sólo para redactar.',
        'Verifica todo lo que tenga consecuencias.',
        'Guarda lo que funciona.',
        'Una herramienta a la vez.',
        'Domina la tarea antes de automatizarla.',
        'Decide qué información no sale nunca.',
      ],
    },
  ],
}
