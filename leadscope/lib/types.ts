export type WebsiteStatus = 'no_website' | 'social_only' | 'broken' | 'outdated' | 'active';

export type Opportunity = 'alta' | 'media' | 'baja';

export type PlanId = 'free' | 'basic' | 'plus' | 'pro';

export interface SearchParams {
  niche: string;
  country?: string;
  city?: string;
  postalCode?: string;
  radiusKm?: number;
  lat?: number;
  lng?: number;
  maxResults?: number;
}

export interface SearchFilters {
  onlyNoWebsite: boolean;
  onlySocialOnly: boolean;
  minReviews: number;
  minRating: number;
  withPhone: boolean;
  withEmail: boolean;
  withWhatsapp: boolean;
}

export const DEFAULT_FILTERS: SearchFilters = {
  onlyNoWebsite: false,
  onlySocialOnly: false,
  minReviews: 0,
  minRating: 0,
  withPhone: false,
  withEmail: false,
  withWhatsapp: false,
};

export interface OpeningHours {
  openNow: boolean | null;
  weekdayText: string[];
}

export interface Business {
  id: string;
  placeId: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  reviewsCount: number;
  category: string;
  openingHours: OpeningHours | null;
  mapsUrl: string;
  website: string | null;
  socialLinks: { facebook?: string; instagram?: string; whatsapp?: string };
  websiteStatus: WebsiteStatus;
  opportunity: Opportunity;
  opportunityScore: number;
}

export interface SearchHistoryItem {
  id: string;
  createdAt: string;
  niche: string;
  location: string;
  filters: SearchFilters;
  resultsCount: number;
  noWebsiteCount: number;
}

export interface PlanConfig {
  id: PlanId;
  name: string;
  priceMonthly: number;
  searchLimitPerMonth: number | null;
  resultsPerSearch: number;
  features: string[];
}

export const PLAN_ORDER: PlanId[] = ['free', 'basic', 'plus', 'pro'];

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Gratis',
    priceMonthly: 0,
    searchLimitPerMonth: 5,
    resultsPerSearch: 20,
    features: [
      '5 búsquedas al mes',
      'Hasta 20 resultados por búsqueda',
      'Exportación a CSV, Excel y PDF',
      'Historial de búsquedas',
    ],
  },
  basic: {
    id: 'basic',
    name: 'Básico',
    priceMonthly: 10,
    searchLimitPerMonth: 30,
    resultsPerSearch: 60,
    features: [
      '30 búsquedas al mes',
      'Hasta 60 resultados por búsqueda',
      'Exportación a CSV, Excel y PDF',
      'Historial y filtros avanzados',
    ],
  },
  plus: {
    id: 'plus',
    name: 'Avanzado',
    priceMonthly: 40,
    searchLimitPerMonth: 150,
    resultsPerSearch: 120,
    features: [
      '150 búsquedas al mes',
      'Hasta 120 resultados por búsqueda',
      'Exportación a CSV, Excel y PDF',
      'Historial y filtros avanzados',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 80,
    searchLimitPerMonth: null,
    resultsPerSearch: 200,
    features: [
      'Búsquedas ilimitadas',
      'Hasta 200 resultados por búsqueda',
      'Exportación a CSV, Excel y PDF',
      'Historial y filtros avanzados',
      'Soporte prioritario',
    ],
  },
};
