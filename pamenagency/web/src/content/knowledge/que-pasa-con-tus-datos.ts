import type { KnowledgeDoc } from './types'

export const quePasaConTusDatos: KnowledgeDoc = {
  slug: 'que-pasa-con-los-datos-que-subes-a-herramientas-de-ia',
  title: 'Qué pasa con los datos que subes a herramientas de IA',
  summary:
    'Todo lo que escribes en una herramienta de IA sale de tu organización y llega a un tercero. Qué preguntar antes de subir información de tu negocio, y cómo distinguir un uso razonable de uno arriesgado.',
  category: 'Confianza',
  level: 'Iniciación',
  updated: '2026-08-19',
  intro: [
    {
      type: 'p',
      text: 'Todo lo que escribes en una herramienta de IA sale de tu ordenador y llega a un servidor de un tercero. Eso no es necesariamente un problema —enviar correo o usar un CRM en la nube también implica lo mismo—, pero merece las mismas preguntas que le harías a cualquier proveedor que va a tener datos de tu negocio, y a veces se saltan por las prisas de probar algo nuevo.',
    },
  ],
  chapters: [
    {
      id: 'que-ocurre-con-lo-que-escribes',
      title: '1. Qué ocurre, en términos generales, con lo que escribes',
      blocks: [
        {
          type: 'p',
          text: 'Según el proveedor y el plan contratado, lo que envías a una herramienta de IA puede: procesarse y descartarse al momento, conservarse un tiempo por motivos de soporte o seguridad, o —en los planes gratuitos de algunos proveedores— usarse para entrenar u mejorar el modelo. Estas tres situaciones son muy distintas entre sí, y la que aplica depende exclusivamente de las condiciones del servicio concreto que uses, no de la IA en general.',
        },
        {
          type: 'callout',
          label: 'La regla que evita la mayoría de los problemas',
          text: 'Los planes de pago orientados a empresas, en la inmensa mayoría de proveedores serios, no usan tus datos para entrenar el modelo por defecto. Los planes gratuitos de consumo, a menudo sí. Es la primera cosa que hay que comprobar, no la última.',
        },
      ],
    },
    {
      id: 'que-preguntar-antes-de-subir-algo',
      title: '2. Qué preguntar antes de subir información de tu negocio',
      blocks: [
        {
          type: 'ul',
          items: [
            '¿Este plan usa mis datos para entrenar el modelo, o no? (Suele estar explícito en la política de privacidad o en la configuración de la cuenta, no siempre a la vista).',
            '¿Dónde se alojan los datos? Algunas herramientas ofrecen alojamiento dentro de la Unión Europea; otras no, y eso importa según qué tipo de dato subas.',
            '¿Puedo firmar un contrato de encargado del tratamiento (DPA) con este proveedor? Si vas a subir datos de clientes o empleados, esto no es opcional: es un requisito del RGPD.',
            '¿Cuánto tiempo se conservan los datos, y puedo pedir que se borren?',
          ],
        },
      ],
    },
    {
      id: 'que-no-subir-nunca-a-una-herramienta-generica',
      title: '3. Qué no subir nunca a una herramienta de propósito general sin comprobar antes',
      blocks: [
        {
          type: 'ul',
          items: [
            'Datos de salud, datos bancarios completos o cualquier categoría de dato especialmente protegida.',
            'Información cubierta por un acuerdo de confidencialidad con un tercero.',
            'Credenciales, contraseñas o claves de acceso —esto parece obvio, y aun así es de lo más habitual que se filtra sin querer, pegado dentro de un documento más largo.',
            'Datos de menores, salvo con las garantías específicas que exige esa categoría.',
          ],
        },
        {
          type: 'p',
          text: 'Ninguno de estos casos significa «no se puede usar IA con esto». Significa que hace falta una herramienta con las garantías contractuales adecuadas, no la primera que aparece al buscar.',
        },
      ],
    },
    {
      id: 'como-lo-hacemos-nosotros',
      title: '4. Un ejemplo concreto: cómo funciona el asistente de esta misma web',
      blocks: [
        {
          type: 'p',
          text: 'El chat de IA que tienes disponible en esta web es un buen ejemplo de aplicar estos criterios en la práctica: la conversación vive sólo en la memoria de tu navegador mientras la ventana está abierta, no se guarda en ningún sitio, y sólo se envía al proveedor que procesa las respuestas —nada más. Al cerrar la pestaña, desaparece. Precisamente por eso no requiere pedirte consentimiento de cookies para funcionar: no hay nada que almacenar.',
        },
        {
          type: 'p',
          text: 'No es la única forma correcta de hacerlo, pero es un ejemplo de que las preguntas de esta guía tienen respuesta concreta, no son una formalidad.',
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
        'Comprueba primero si el plan que usas entrena el modelo con tus datos: es la pregunta más importante.',
        'Si vas a subir datos de clientes o empleados, necesitas un contrato de encargado del tratamiento (DPA), no es opcional.',
        'Hay categorías de datos que no se suben a una herramienta genérica sin garantías específicas.',
        'Un proveedor serio siempre puede responder estas preguntas con claridad. Si no puede, es una señal en sí misma.',
      ],
    },
  ],
}
