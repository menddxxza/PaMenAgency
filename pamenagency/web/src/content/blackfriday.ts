/**
 * Campaña de Black Friday 2026: «Black Friday al revés». No se bajan precios: se regalan
 * 10 herramientas a medida (cada una automatiza un proceso sencillo) a cambio de poder contar
 * el caso. Decidido por Pablo (24/11/2026): 10 plazas, y que se diga «herramientas», no
 * «automatizaciones». Es una selección, no un sorteo.
 */
/** La campaña sigue abierta (la promoción de la web desaparece sola al cerrar). */
export function bfActivo(ahora = Date.now()) {
  return ahora <= Date.parse(blackFriday.cierre)
}

/** «Quedan 6 días», o «Último día» en las 24 horas finales. */
export function bfQuedan(ahora = Date.now()) {
  const ms = Date.parse(blackFriday.cierre) - ahora
  if (ms < 864e5) return 'Último día'
  const d = Math.floor(ms / 864e5)
  return d === 1 ? 'Queda 1 día' : `Quedan ${d} días`
}

export const blackFriday = {
  plazas: 10,
  /** Último momento para apuntarse (hora peninsular). */
  cierre: '2026-11-30T23:59:59+01:00',
  cierreTexto: 'lunes 30 de noviembre a las 23:59',
  avisoTexto: 'a partir del 2 de diciembre',

  regalamos: [
    { titulo: 'Diagnóstico de 30 minutos', texto: 'Vemos a qué te dedicas y dónde se te va el tiempo. Sin tecnicismos.' },
    { titulo: 'Una herramienta a tu medida', texto: 'Hace sola una tarea sencilla y concreta que hoy haces a mano. Te la dejamos montada y funcionando.' },
    { titulo: 'Con tus herramientas', texto: 'Con los programas que ya usas. Lo probamos con casos reales antes de entregarlo.' },
  ],

  pedimos: [
    'Que nos dejes contar tu caso (con el nombre de tu empresa o sin él, como prefieras).',
    'Tu opinión sincera cuando lo tengas funcionando.',
    'Nada más: no tienes que contratar nada después.',
  ],

  elegimos: [
    'Que haya una tarea concreta que se repite: copiar datos, reenviar correos, preparar el mismo informe…',
    'Que los programas que usas permitan conectarse (lo comprobamos nosotros).',
    'Variedad: preferimos 10 sectores distintos a 10 iguales.',
  ],

  bases: [
    'Organiza PaMenAgency (ver el aviso legal para los datos del titular).',
    'Pueden apuntarse empresas y autónomos con actividad en España, hasta el lunes 30 de noviembre de 2026 a las 23:59 (hora peninsular).',
    'No es un sorteo: PaMenAgency elige las 10 empresas según lo bien que encaje su caso, con los criterios de esta página.',
    'El regalo es un diagnóstico de 30 minutos y una herramienta a medida que automatiza un proceso sencillo y bien delimitado (lo que en la web aparece como «desde 200 €»).',
    'Si el proceso necesita una herramienta o suscripción de pago de terceros, su coste no está incluido; te lo diremos antes de empezar y puedes renunciar sin coste.',
    'Las herramientas se hacen entre diciembre de 2026 y enero de 2027, por orden de selección. El mantenimiento posterior no está incluido (es opcional).',
    'A cambio, la empresa autoriza a PaMenAgency a contar el caso y a publicar su opinión, con o sin su nombre, a su elección. No hay obligación de contratar nada.',
    'Todas las empresas que se apunten, elegidas o no, pueden pedir el diagnóstico gratuito de 30 minutos.',
    'Los datos del formulario se usan solo para gestionar esta campaña y contactar contigo, según la política de privacidad.',
  ],
}
