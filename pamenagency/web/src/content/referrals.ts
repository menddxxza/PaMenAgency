/**
 * Programa de referidos.
 *
 * Los porcentajes son una propuesta de partida, no una cifra ya acordada:
 * antes de publicar esta página en producción, confirma o ajusta
 * `recompensaQuienRefiere` y `recompensaReferido` a lo que quieras ofrecer
 * de verdad. El resto de la página se genera a partir de estos datos, así
 * que cambiarlos aquí basta.
 */
export const referral = {
  recompensaQuienRefiere: '10 % de descuento en tu próximo servicio',
  recompensaReferido: '10 % de descuento en su primer servicio',
  pasos: [
    {
      titulo: 'Nos escribes con el contacto',
      texto: 'Nombre y email de la persona o empresa a la que quieres recomendarnos.',
    },
    {
      titulo: 'Contactamos y, si contrata, se aplica el descuento',
      texto:
        'Le explicamos qué hacemos sin presionar. Si decide trabajar con nosotros, el descuento se aplica a su primer servicio.',
    },
    {
      titulo: 'Tu descuento queda disponible',
      texto: 'Lo aplicamos en tu siguiente servicio, sin caducidad artificial.',
    },
  ],
  condiciones: [
    'Vale para cualquier servicio del catálogo, sin mínimo de importe.',
    'No hay límite de referidos: cada uno que contrate genera un nuevo descuento.',
    'No se aplica si la persona referida ya nos había contactado antes.',
  ],
} as const
