/**
 * Reseñas reales del perfil de Google de PaMenAgency, copiadas tal cual
 * (2 de noviembre de 2026). No se inventan ni se retocan: si cambian en
 * Google, se actualizan aquí. Del autor solo se muestra nombre e inicial.
 *
 * Sin datos estructurados de valoración (schema.org AggregateRating): Google
 * no admite reseñas sobre el propio negocio publicadas en su web.
 */
export type Resena = { autor: string; estrellas: number; texto: string }

export const perfilGoogle = {
  url: 'https://www.google.com/maps?cid=1203266041437577627',
  media: '5,0',
  total: 4,
}

export const resenas: Resena[] = [
  {
    autor: 'Juan Pedro M.',
    estrellas: 5,
    texto:
      '100% recomendable para automatizar tu negocio, te ayudan a ahorrar tiempo y dinero. Muy contento con ellos la verdad',
  },
  {
    autor: 'Amanda C.',
    estrellas: 5,
    texto: 'Agencia que te guía paso a paso y beneficia a tu negocio! totalmente recomendable!',
  },
  {
    autor: 'Alberto M.',
    estrellas: 5,
    texto: 'Un trato excelente desde el primer dia, encantado de trabajar con el!',
  },
]
