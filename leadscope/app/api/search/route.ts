import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { searchPlaces } from '@/lib/google-places';
import { checkWebsitesBatch } from '@/lib/website-detector';
import { maybeReclassifyOutdated } from '@/lib/ai-classifier';
import { computeOpportunity } from '@/lib/opportunity-score';
import { PLANS, type Business, type PlanId } from '@/lib/types';
import type { Json } from '@/types/database.types';

export const maxDuration = 60;

const bodySchema = z.object({
  niche: z.string().min(2).max(120),
  country: z.string().max(80).optional(),
  city: z.string().max(120).optional(),
  postalCode: z.string().max(20).optional(),
  radiusKm: z.number().min(1).max(100).optional(),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Parámetros de búsqueda inválidos' }, { status: 400 });
  }
  const params = parsed.data;

  if (!params.city && !params.postalCode && !params.country) {
    return NextResponse.json(
      { error: 'Indica al menos país, ciudad o código postal' },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const plan: PlanId = (profile?.plan as PlanId) ?? 'free';
  const planConfig = PLANS[plan];

  const { data: allowed, error: usageError } = await supabase.rpc(
    'increment_usage_and_check_limit',
    { p_user_id: user.id, p_limit: planConfig.searchLimitPerMonth }
  );

  if (usageError) {
    return NextResponse.json({ error: 'No se pudo verificar el límite de uso' }, { status: 500 });
  }

  if (!allowed) {
    return NextResponse.json(
      {
        error: `Has alcanzado el límite de ${planConfig.searchLimitPerMonth} búsquedas del plan gratuito este mes. Mejora a Pro para búsquedas ilimitadas.`,
        code: 'LIMIT_REACHED',
      },
      { status: 402 }
    );
  }

  let rawResults;
  try {
    rawResults = await searchPlaces({ ...params, maxResults: planConfig.resultsPerSearch });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error consultando Google Places' },
      { status: 502 }
    );
  }

  const websiteChecks = await checkWebsitesBatch(rawResults.map((r) => r.website));

  const businesses: Business[] = await Promise.all(
    rawResults.map(async (place, i) => {
      const check = websiteChecks[i]!;
      const finalStatus = await maybeReclassifyOutdated(check.html, check.status);
      const { opportunity, score } = computeOpportunity({
        websiteStatus: finalStatus,
        rating: place.rating,
        reviewsCount: place.reviewsCount,
      });

      return {
        ...place,
        email: check.email,
        socialLinks: check.socialLinks,
        websiteStatus: finalStatus,
        opportunity,
        opportunityScore: score,
      };
    })
  );

  const noWebsiteCount = businesses.filter((b) => b.websiteStatus === 'no_website').length;
  const location = [params.city, params.postalCode, params.country].filter(Boolean).join(', ');

  const { data: search, error: searchError } = await supabase
    .from('searches')
    .insert({
      user_id: user.id,
      niche: params.niche,
      country: params.country ?? null,
      city: params.city ?? null,
      postal_code: params.postalCode ?? null,
      radius_km: params.radiusKm ?? null,
      results_count: businesses.length,
      no_website_count: noWebsiteCount,
    })
    .select('id, created_at')
    .single();

  if (!searchError && search) {
    await supabase.from('search_results').insert(
      businesses.map((b) => ({
        search_id: search.id,
        user_id: user.id,
        place_id: b.placeId,
        name: b.name,
        phone: b.phone,
        email: b.email,
        address: b.address,
        lat: b.lat,
        lng: b.lng,
        rating: b.rating,
        reviews_count: b.reviewsCount,
        category: b.category,
        opening_hours: b.openingHours as unknown as Json,
        maps_url: b.mapsUrl,
        website: b.website,
        social_links: b.socialLinks as unknown as Json,
        website_status: b.websiteStatus,
        opportunity: b.opportunity,
        opportunity_score: b.opportunityScore,
      }))
    );
  }

  return NextResponse.json({
    searchId: search?.id ?? null,
    location,
    results: businesses,
    plan,
  });
}
