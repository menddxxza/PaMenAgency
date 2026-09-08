import type { IconName } from '@/components/ui/Icon'

/**
 * Las áreas de una empresa donde la IA puede actuar.
 *
 * Cada una se cuenta igual: qué duele hoy, qué se hace al respecto y qué
 * queda después. Nada de porcentajes ni promesas: sólo la fricción concreta
 * que cualquiera reconoce de su propia semana.
 */
export type Area = {
  slug: string
  nombre: string
  icon: IconName
  problema: string
  solucion: string
  resultado: string
}

export const areas: Area[] = [
  {
    slug: 'ventas',
    nombre: 'Ventas',
    icon: 'target',
    problema:
      'Contactos que se enfrían porque nadie los sigue, y la información del cliente repartida entre el correo, el móvil y la cabeza de alguien.',
    solucion:
      'Cualificación y seguimiento automáticos, con la ficha del cliente al día sin escribirla a mano.',
    resultado: 'Ningún contacto se pierde por olvido y el comercial dedica el tiempo a hablar, no a apuntar.',
  },
  {
    slug: 'operaciones',
    nombre: 'Operaciones',
    icon: 'gears',
    problema:
      'Tareas que se repiten igual cada semana: copiar datos de un sitio a otro, rellenar el mismo documento, reenviar el mismo correo.',
    solucion:
      'Procesos que se ejecutan solos, con una persona revisando únicamente lo que se sale de lo normal.',
    resultado: 'Horas concretas que vuelven a la semana, medibles desde el primer mes.',
  },
  {
    slug: 'atencion',
    nombre: 'Atención al cliente',
    icon: 'chat',
    problema:
      'Las mismas veinte preguntas cada día, muchas fuera de horario, y respuestas que tardan porque quien sabe contestarlas está ocupado.',
    solucion:
      'Un sistema que entiende la consulta, responde con lo que tu empresa ya tiene escrito y pasa a una persona lo que no le corresponde.',
    resultado: 'Respuesta a cualquier hora y el equipo interviniendo sólo donde aporta.',
  },
  {
    slug: 'conocimiento',
    nombre: 'Conocimiento interno',
    icon: 'book',
    problema:
      'La información está, pero repartida en manuales, contratos y carpetas que nadie recuerda dónde están.',
    solucion:
      'Un sistema que responde preguntas usando tu propia documentación e indica de dónde sale cada respuesta.',
    resultado: 'Se deja de interrumpir al compañero de al lado para encontrar algo que ya estaba escrito.',
  },
  {
    slug: 'datos',
    nombre: 'Datos y sistemas',
    icon: 'layers',
    problema: 'Cada herramienta guarda su versión de la verdad y ninguna se habla con las demás.',
    solucion:
      'Mapa de dónde está cada dato, qué está duplicado y qué hay que conectar antes de automatizar nada.',
    resultado: 'Una base sobre la que la IA puede trabajar sin rellenar huecos por su cuenta.',
  },
  {
    slug: 'administracion',
    nombre: 'Administración',
    icon: 'coins',
    problema:
      'Facturas que se pasan a mano, cobros que se reclaman tarde y un cierre de mes que se come días enteros.',
    solucion:
      'Lectura automática de documentos, avisos de lo que falta e informes que se preparan solos.',
    resultado: 'Menos trabajo administrativo repetido y menos errores de transcripción.',
  },
  {
    slug: 'personas',
    nombre: 'Personas y equipo',
    icon: 'people',
    problema:
      'La incorporación de alguien nuevo depende de que otro saque tiempo, y las mismas dudas internas se resuelven una y otra vez.',
    solucion: 'Documentación viva y asistentes internos que responden lo de siempre.',
    resultado: 'Quien entra arranca antes sin bloquear al resto del equipo.',
  },
  {
    slug: 'direccion',
    nombre: 'Dirección',
    icon: 'compass',
    problema: 'Decisiones que se toman sin datos porque reunirlos costaría una mañana entera.',
    solucion: 'Informes que se generan solos y una lectura clara de lo que está pasando.',
    resultado: 'Menos intuición y más criterio, con la información delante antes de decidir.',
  },
]
