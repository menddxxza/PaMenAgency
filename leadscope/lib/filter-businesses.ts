import type { Business, SearchFilters } from '@/lib/types';

export function filterBusinesses(
  businesses: Business[],
  filters: SearchFilters,
  query: string
): Business[] {
  const q = query.trim().toLowerCase();

  return businesses.filter((b) => {
    if (filters.onlyNoWebsite && b.websiteStatus !== 'no_website') return false;
    if (filters.onlySocialOnly && b.websiteStatus !== 'social_only') return false;
    if (filters.withPhone && !b.phone) return false;
    if (filters.withEmail && !b.email) return false;
    if (filters.withWhatsapp && !b.socialLinks.whatsapp) return false;
    if (filters.minReviews > 0 && b.reviewsCount < filters.minReviews) return false;
    if (filters.minRating > 0 && (b.rating ?? 0) < filters.minRating) return false;

    if (q) {
      const haystack = `${b.name} ${b.address} ${b.category}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}
