import type { KnowledgeDoc } from './types'

export const grietasDoc: KnowledgeDoc = {
  slug: 'las-grietas-de-la-ia',
  title: 'Las grietas de la IA',
  summary:
    'Todo lo que la Inteligencia Artificial hace mal, explicado sin dramatismo y con qué hacer al respecto. Conocer sus límites es parte de saber utilizarla.',
  category: 'Criterio',
  level: 'Intermedio',
  updated: '2026-08-18',
  intro: [
    {
      type: 'p',
      text: 'Este documento no existe para desanimar a nadie. Existe porque la mayor parte de los problemas serios con la IA no vienen de usarla, sino de usarla sin saber dónde falla.',
    },
    {
      type: 'quote',
      text: 'Conocer sus límites es parte de saber utilizarla.',
    },
    {
      type: 'p',
      text: 'Una estructura puede ser sólida y tener grietas. El problema nunca es la grieta: es no saber que está ahí y apoyar el peso justo encima.',
    },
  ],
  chapters: [
    {
      id: 'alucinaciones',
      title: '1. Alucinaciones',
      blocks: [
        {
          type: 'p',
          text: 'Un modelo de lenguaje no consulta una base de datos de hechos: genera la continuación más probable de un texto. Cuando la información existe y es frecuente, esa continuación coincide con la realidad. Cuando no, sigue generando igualmente.',
        },
        {
          type: 'p',
          text: 'Lo peligroso no es que se equivoque, sino que **se equivoca con el mismo tono de seguridad con el que acierta**. No hay ninguna señal en la redacción que distinga una respuesta correcta de una inventada.',
        },
        {
          type: 'example',
          label: 'Dónde aparece más',
          text: 'Referencias bibliográficas, artículos de normativa, cifras concretas, fechas, nombres de personas, funciones de software poco comunes y cualquier cosa muy específica de un sector pequeño.',
        },
        {
          type: 'callout',
          label: 'Qué hacer',
          text: 'Trata toda afirmación verificable como no verificada. Si vas a publicarlo, firmarlo o enviarlo a un cliente, compruébalo en la fuente original.',
        },
      ],
    },
    {
      id: 'contexto',
      title: '2. Problemas de contexto',
      blocks: [
        {
          type: 'p',
          text: 'La IA no sabe nada de ti. No conoce tu sector, tus clientes, tus restricciones ni lo que pasó el mes pasado. Cuando no le das contexto, responde a la media de todo lo que ha leído, y esa media no es tu caso.',
        },
        {
          type: 'p',
          text: 'De aquí viene la sensación tan extendida de «me da respuestas genéricas». No es que la herramienta sea mala: es que se le ha pedido con una sola línea algo que necesitaba diez.',
        },
        {
          type: 'ul',
          items: [
            'Quién eres y a qué te dedicas.',
            'Para quién es lo que estás pidiendo.',
            'Qué restricciones existen: tono, longitud, formato, lo que no se puede decir.',
            'Qué has probado ya y por qué no funcionó.',
          ],
        },
        {
          type: 'p',
          text: 'Hay además un límite técnico: la ventana de contexto. En conversaciones muy largas, lo dicho al principio deja de pesar. Si algo es importante, conviene repetirlo cuando la conversación se alarga.',
        },
      ],
    },
    {
      id: 'criterio',
      title: '3. Falta de criterio',
      blocks: [
        {
          type: 'p',
          text: 'Puede redactar la defensa impecable de una decisión y, acto seguido, la defensa impecable de la contraria. No tiene preferencias, no soporta las consecuencias y no sabe qué está en juego para ti.',
        },
        {
          type: 'callout',
          label: 'Regla práctica',
          variant: 'warn',
          text: 'Úsala para generar y ordenar opciones. No para elegir entre ellas. La decisión, y la responsabilidad, siguen siendo tuyas.',
        },
        {
          type: 'p',
          text: 'Esto se vuelve especialmente delicado en procesos que afectan a personas: selección de candidatos, evaluación, concesión o denegación de algo. Ahí la falta de criterio se combina con el siguiente problema.',
        },
      ],
    },
    {
      id: 'sesgos',
      title: '4. Sesgos',
      blocks: [
        {
          type: 'p',
          text: 'Los modelos aprenden de textos escritos por personas y absorben sus desequilibrios. No es una intención: es una consecuencia estadística de a qué se ha expuesto el modelo y con qué frecuencia.',
        },
        {
          type: 'p',
          text: 'El resultado se nota poco en tareas neutras y bastante en las que implican valorar a alguien o a algo. Un sesgo aplicado a mano afecta a un caso; automatizado, se aplica de forma sistemática y sin que nadie lo vea.',
        },
        {
          type: 'callout',
          label: 'Qué hacer',
          text: 'No la coloques como decisor en procesos con impacto sobre personas. Como apoyo, con revisión humana y con capacidad de explicar la decisión, sí.',
        },
      ],
    },
    {
      id: 'privacidad',
      title: '5. Privacidad y datos',
      blocks: [
        {
          type: 'p',
          text: 'Todo lo que escribes en una herramienta de IA sale de tu organización y llega a un tercero. Según el proveedor y el plan contratado, ese contenido puede conservarse durante un tiempo o utilizarse para mejorar el servicio.',
        },
        {
          type: 'p',
          text: 'El problema no suele ser el uso deliberado, sino el cotidiano: pegar un contrato para que lo resuma, subir un listado de clientes para ordenarlo, volcar un historial para redactar un informe.',
        },
        {
          type: 'ul',
          items: [
            'Datos personales de clientes, pacientes o empleados.',
            'Información sanitaria, financiera o laboral identificable.',
            'Contratos, condiciones y documentación con obligación de confidencialidad.',
            'Credenciales, claves y accesos.',
          ],
        },
        {
          type: 'callout',
          label: 'Qué hacer',
          text: 'Decide qué no sale nunca antes de elegir herramienta, no después. Esa decisión condiciona qué opciones son válidas, y no al revés.',
        },
      ],
    },
    {
      id: 'actualizacion',
      title: '6. Información desactualizada',
      blocks: [
        {
          type: 'p',
          text: 'El conocimiento de un modelo tiene una fecha de corte. Si no consulta fuentes en tiempo real, describirá el mundo tal y como era en esa fecha, con total naturalidad y sin avisar de que puede haber cambiado.',
        },
        {
          type: 'example',
          label: 'Dónde duele',
          text: 'Normativa, precios, condiciones de servicios, versiones de software y cualquier cosa que se haya modificado en los últimos meses.',
        },
      ],
    },
    {
      id: 'dependencia',
      title: '7. Dependencia y coste',
      blocks: [
        {
          type: 'p',
          text: 'Un proceso construido íntegramente sobre una herramienta hereda todo lo que le ocurra a esa herramienta: cambios de precio, cambios de condiciones, funciones que desaparecen y caídas de servicio.',
        },
        {
          type: 'p',
          text: 'A esto se suma un coste que no aparece en ninguna factura: el tiempo de aprendizaje, el de mantenimiento y el de revisar lo que la herramienta produce. Es habitual encontrar organizaciones pagando cuatro suscripciones que se solapan.',
        },
        {
          type: 'ul',
          items: [
            'Documenta tus flujos: qué hace cada paso y por qué.',
            'Evita que un proceso crítico dependa de un único proveedor.',
            'Revisa cada trimestre qué herramientas se usan de verdad.',
            'Ten claro qué pasaría mañana si una de ellas cerrase.',
          ],
        },
      ],
    },
    {
      id: 'automatizaciones-malas',
      title: '8. Automatizaciones mal planteadas',
      blocks: [
        {
          type: 'p',
          text: 'Esta es la grieta más cara, porque no se manifiesta el primer día. Un error humano ocurre una vez y alguien lo ve. Un error automatizado ocurre mil veces y nadie lo ve hasta que un cliente lo señala.',
        },
        {
          type: 'ul',
          items: [
            'Automatizar un proceso que nadie había revisado antes.',
            'No definir qué ocurre cuando un paso falla.',
            'No dejar rastro de lo que el sistema hizo y cuándo.',
            'No avisar a nadie cuando el flujo se detiene.',
            'Dar por bueno el resultado porque «lleva semanas funcionando».',
          ],
        },
        {
          type: 'callout',
          label: 'Regla',
          variant: 'warn',
          text: 'Toda automatización necesita tres cosas antes de entrar en producción: un registro de lo que hace, un aviso cuando falla y una forma de pararla.',
        },
      ],
    },
    {
      id: 'exceso-de-confianza',
      title: '9. Exceso de confianza',
      blocks: [
        {
          type: 'p',
          text: 'La última grieta no está en la tecnología, está en nosotros. Cuanto mejor escribe un sistema, menos se revisa lo que escribe. Confundimos calidad de redacción con calidad de contenido.',
        },
        {
          type: 'quote',
          text: 'Revisa con más atención lo que mejor suena. Es exactamente donde menos se mira.',
        },
        {
          type: 'p',
          text: 'Hay una segunda forma de este exceso, más lenta: la pérdida de capacidad propia. Delegar sistemáticamente lo que uno sabe hacer termina atrofiando el criterio con el que se juzga si la respuesta era buena. Y ese criterio es justamente lo que hace que la herramienta valga algo.',
        },
      ],
    },
  ],
  conclusion: [
    {
      type: 'p',
      text: 'Ninguna de estas grietas es motivo para no usar IA. Todas son motivo para usarla con las manos en el volante.',
    },
    {
      type: 'callout',
      label: 'Lo mínimo',
      text: 'Verifica lo verificable. Da contexto. Decide tú. No subas lo que no debe salir. Documenta lo que automatizas. Y revisa con más cuidado lo que mejor suena.',
    },
  ],
}
