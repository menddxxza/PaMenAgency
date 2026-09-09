import type { IconName } from '@/components/ui/Icon'

/**
 * Escenarios de transformación.
 *
 * IMPORTANTE: son ejercicios, no proyectos realizados. No hay cliente
 * detrás de ninguno, y en ningún sitio se insinúa que lo haya. Existen
 * porque un visitante necesita ver cómo se aplicaría el método a un caso
 * completo, y la alternativa —inventarse casos de éxito con logos y
 * cifras— es exactamente lo que esta web no hace.
 *
 * Regla al escribirlos: ningún porcentaje, ninguna cifra de ahorro,
 * ningún "reducimos un X %". Lo que cambia se describe en términos
 * cualitativos y verificables.
 */
export type Scenario = {
  slug: string
  titulo: string
  icon: IconName
  /** La empresa imaginada. Deliberadamente genérica y realista. */
  empresa: string
  situacion: string
  /** Las fases, en el orden en que se harían. */
  fases: { titulo: string; texto: string }[]
  /** Qué cambiaría, sin cifras. */
  resultado: string[]
  /** Qué NO se tocaría, y por qué. */
  fuera: string
}

export const scenarios: Scenario[] = [
  {
    slug: 'departamento-comercial',
    titulo: 'Cómo abordaríamos un departamento comercial',
    icon: 'target',
    empresa: 'Empresa de servicios, unas 40 personas, 5 comerciales, CRM instalado pero medio vacío.',
    situacion:
      'Entran contactos por la web, por teléfono y por recomendación. Cada comercial lleva los suyos como puede: unos en el CRM, otros en una hoja de cálculo y otros en la cabeza. Los contactos que no compran en el primer mes desaparecen, y nadie sabe cuántos son ni por qué se fueron.',
    fases: [
      {
        titulo: 'Semana 1-2 — Mirar antes de tocar',
        texto:
          'Acompañamos a los comerciales un par de días. No para auditarlos, sino para ver cuántas veces al día escriben lo mismo en dos sitios distintos y en qué punto exacto se pierde un contacto.',
      },
      {
        titulo: 'Semana 3 — Ordenar la entrada',
        texto:
          'Un único punto de entrada para todos los contactos, vengan del canal que vengan. Antes de automatizar nada hay que poder contar cuántos son: sin eso, cualquier mejora posterior es imposible de medir.',
      },
      {
        titulo: 'Semana 4-6 — Quitar el trabajo de apuntar',
        texto:
          'La ficha del cliente se rellena sola con lo que ya existe: web de la empresa, correos intercambiados, notas de la llamada. El comercial revisa y corrige; no transcribe.',
      },
      {
        titulo: 'Semana 7-8 — Que nada se enfríe solo',
        texto:
          'Seguimientos que se disparan por sí mismos cuando un contacto lleva demasiado tiempo parado, con un borrador ya preparado. Enviarlo sigue siendo decisión de una persona.',
      },
      {
        titulo: 'Después — Medir y decidir',
        texto:
          'Al tercer mes se compara con el punto de partida que se midió en la semana 3. Lo que no haya movido nada se retira: mantener una automatización que no aporta también cuesta.',
      },
    ],
    resultado: [
      'Se puede responder, con datos, a cuántos contactos entran y dónde se pierden.',
      'El comercial dedica a hablar el tiempo que antes dedicaba a registrar.',
      'Ningún contacto se queda parado sin que nadie se entere.',
    ],
    fuera:
      'La conversación de venta. Ni la llamada, ni la propuesta a medida, ni la negociación: ahí el criterio de una persona es justo lo que hace que se cierre.',
  },
  {
    slug: 'operaciones-administrativas',
    titulo: 'Cómo abordaríamos la administración de una pyme',
    icon: 'gears',
    empresa: 'Distribuidora pequeña, 12 personas, 2 en administración, cientos de facturas al mes.',
    situacion:
      'Las facturas llegan por correo en PDF, alguien las abre una a una, teclea los datos en el programa de gestión y archiva el fichero. El cierre de mes se lleva tres días. Cuando alguien está de baja, se acumula.',
    fases: [
      {
        titulo: 'Fase 1 — Contar el trabajo real',
        texto:
          'Cuántas facturas, de cuántos proveedores distintos, con cuántos formatos. Esto marca la diferencia entre un proyecto de tres semanas y uno inviable.',
      },
      {
        titulo: 'Fase 2 — Empezar por los proveedores repetidos',
        texto:
          'Los cinco o seis proveedores que concentran la mayoría de facturas y siempre mandan el mismo formato. Ahí la lectura automática funciona bien desde el primer día.',
      },
      {
        titulo: 'Fase 3 — Validación humana en lo que importa',
        texto:
          'Los importes y los datos fiscales se muestran para revisión antes de registrarse. Un error de transcripción automatizado sigue siendo un error, y en contabilidad se paga.',
      },
      {
        titulo: 'Fase 4 — Lo que falta y lo que no cuadra',
        texto:
          'Avisos de facturas que no han llegado, importes fuera de lo habitual y duplicados. Aquí es donde se recupera más tiempo del que parece.',
      },
    ],
    resultado: [
      'El grueso de las facturas repetidas deja de teclearse a mano.',
      'Los casos raros siguen pasando por una persona, que ahora tiene tiempo para mirarlos bien.',
      'Una baja deja de convertirse en un atasco de dos semanas.',
    ],
    fuera:
      'Las decisiones contables y fiscales. El sistema lee y propone; qué se imputa dónde lo sigue decidiendo quien tiene la responsabilidad de firmarlo.',
  },
  {
    slug: 'conocimiento-interno',
    titulo: 'Cómo montaríamos un sistema de conocimiento interno',
    icon: 'book',
    empresa: 'Empresa técnica, 25 personas, mucha rotación en el equipo de soporte.',
    situacion:
      'Los procedimientos están escritos, pero repartidos entre una carpeta compartida, un gestor documental antiguo y los correos de dos personas que llevan años allí. Cada incorporación nueva tarda semanas en ser autónoma, y siempre a costa del tiempo de los veteranos.',
    fases: [
      {
        titulo: 'Fase 1 — Saber qué hay y qué está caducado',
        texto:
          'Inventario de la documentación existente y, sobre todo, de la que ya no vale. Un sistema que responde con procedimientos obsoletos es peor que no tener sistema.',
      },
      {
        titulo: 'Fase 2 — Escribir lo que sólo está en la cabeza de alguien',
        texto:
          'Siempre hay una parte crítica sin documentar. Esta fase no la hace la IA: la hacen las personas que lo saben, con una estructura que les facilite volcarlo.',
      },
      {
        titulo: 'Fase 3 — Preguntar en lenguaje normal',
        texto:
          'El sistema responde citando el documento del que sale cada respuesta, para que se pueda verificar. Y cuando la respuesta no está en la documentación, lo dice en vez de improvisarla.',
      },
      {
        titulo: 'Fase 4 — Que no se pudra',
        texto:
          'Lo que más se pregunta y no tiene respuesta señala exactamente qué documentación falta. El sistema se convierte en el termómetro de sus propios huecos.',
      },
    ],
    resultado: [
      'Quien entra encuentra la respuesta sin interrumpir a un compañero.',
      'Se sabe qué documentación falta, porque lo dicen las preguntas sin respuesta.',
      'El conocimiento deja de depender de que dos personas concretas sigan en la empresa.',
    ],
    fuera:
      'El criterio. El sistema cuenta cuál es el procedimiento; decidir cuándo saltárselo con motivo sigue siendo cosa de una persona con experiencia.',
  },
]

export const getScenario = (slug: string | undefined) => scenarios.find((s) => s.slug === slug)
