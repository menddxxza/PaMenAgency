import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Topbar } from '@/components/dashboard/topbar';
import { HistoryResults } from '@/components/search/history-results';
import type { Business } from '@/lib/types';

export default async function HistoryDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: search } = await supabase
    .from('searches')
    .select('id, niche, city, postal_code, country')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single();

  if (!search) notFound();

  const { data: rows } = await supabase
    .from('search_results')
    .select('*')
    .eq('search_id', params.id)
    .order('opportunity_score', { ascending: false });

  const businesses: Business[] = (rows ?? []).map((r) => ({
    id: r.id,
    placeId: r.place_id,
    name: r.name,
    phone: r.phone,
    email: r.email,
    address: r.address ?? '',
    lat: r.lat ?? 0,
    lng: r.lng ?? 0,
    rating: r.rating,
    reviewsCount: r.reviews_count,
    category: r.category ?? 'General',
    openingHours: (r.opening_hours as Business['openingHours']) ?? null,
    mapsUrl: r.maps_url ?? '#',
    website: r.website,
    socialLinks: (r.social_links as Business['socialLinks']) ?? {},
    websiteStatus: r.website_status,
    opportunity: r.opportunity,
    opportunityScore: r.opportunity_score,
  }));

  const location = [search.city, search.postal_code, search.country].filter(Boolean).join(', ');

  return (
    <>
      <Topbar title={`${search.niche} · ${location || 'Sin ubicación'}`} />
      <main className="flex-1 p-4 sm:p-6">
        <HistoryResults businesses={businesses} />
      </main>
    </>
  );
}
