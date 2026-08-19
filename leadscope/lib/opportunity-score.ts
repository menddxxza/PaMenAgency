import type { Opportunity, WebsiteStatus } from '@/lib/types';

const STATUS_WEIGHT: Record<WebsiteStatus, number> = {
  no_website: 50,
  social_only: 38,
  broken: 42,
  outdated: 28,
  active: 0,
};

/**
 * Puntúa de 0 a 100 la oportunidad comercial de contactar a un negocio:
 * negocios sin web (o con web rota/desfasada) que además tienen buena
 * reputación y volumen de reseñas son el objetivo ideal para vender una web.
 */
export function computeOpportunity(input: {
  websiteStatus: WebsiteStatus;
  rating: number | null;
  reviewsCount: number;
}): { opportunity: Opportunity; score: number } {
  const statusScore = STATUS_WEIGHT[input.websiteStatus];

  const ratingScore = input.rating ? Math.min((input.rating / 5) * 25, 25) : 8;

  const reviewsScore = Math.min(Math.log10(input.reviewsCount + 1) * 10, 25);

  const score = Math.round(Math.min(statusScore + ratingScore + reviewsScore, 100));

  const opportunity: Opportunity = score >= 65 ? 'alta' : score >= 35 ? 'media' : 'baja';

  return { opportunity, score };
}
