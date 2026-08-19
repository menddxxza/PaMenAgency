import type { Business, SearchParams } from '@/lib/types';

const PLACES_BASE = 'https://places.googleapis.com/v1';
const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.primaryTypeDisplayName',
  'places.internationalPhoneNumber',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.regularOpeningHours',
  'places.googleMapsUri',
  'nextPageToken',
].join(',');

interface RawPlace {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  primaryTypeDisplayName?: { text: string };
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  googleMapsUri?: string;
}

interface SearchTextResponse {
  places?: RawPlace[];
  nextPageToken?: string;
}

async function apiKey() {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error('GOOGLE_PLACES_API_KEY no está configurada');
  return key;
}

export async function geocodeLocation(input: {
  city?: string;
  country?: string;
  postalCode?: string;
}): Promise<{ lat: number; lng: number } | null> {
  const address = [input.postalCode, input.city, input.country].filter(Boolean).join(', ');
  if (!address) return null;

  const url = new URL(GEOCODE_URL);
  url.searchParams.set('address', address);
  url.searchParams.set('key', await apiKey());

  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = await res.json();
  const location = data?.results?.[0]?.geometry?.location;
  return location ? { lat: location.lat, lng: location.lng } : null;
}

function rawPlaceToBusiness(place: RawPlace): Omit<
  Business,
  'websiteStatus' | 'opportunity' | 'opportunityScore' | 'socialLinks' | 'email'
> {
  return {
    id: place.id,
    placeId: place.id,
    name: place.displayName?.text ?? 'Sin nombre',
    phone: place.internationalPhoneNumber ?? place.nationalPhoneNumber ?? null,
    address: place.formattedAddress ?? '',
    lat: place.location?.latitude ?? 0,
    lng: place.location?.longitude ?? 0,
    rating: place.rating ?? null,
    reviewsCount: place.userRatingCount ?? 0,
    category: place.primaryTypeDisplayName?.text ?? 'General',
    openingHours: place.regularOpeningHours
      ? {
          openNow: place.regularOpeningHours.openNow ?? null,
          weekdayText: place.regularOpeningHours.weekdayDescriptions ?? [],
        }
      : null,
    mapsUrl: place.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${place.id}`,
    website: place.websiteUri ?? null,
  };
}

/**
 * Busca negocios por nicho + ubicación usando Places API (New) Text Search,
 * paginando hasta completar maxResults (máx. 20 por página, la API exige
 * un pequeño delay antes de poder usar el pageToken siguiente).
 */
export async function searchPlaces(
  params: SearchParams
): Promise<ReturnType<typeof rawPlaceToBusiness>[]> {
  const key = await apiKey();
  const maxResults = Math.min(params.maxResults ?? 20, 200);

  let center = params.lat && params.lng ? { lat: params.lat, lng: params.lng } : null;
  if (!center && (params.city || params.postalCode || params.country)) {
    center = await geocodeLocation(params);
  }

  const textQuery = [params.niche, params.city, params.postalCode, params.country]
    .filter(Boolean)
    .join(' en ');

  const results: ReturnType<typeof rawPlaceToBusiness>[] = [];
  let pageToken: string | undefined;

  do {
    const body: Record<string, unknown> = {
      textQuery,
      pageSize: Math.min(20, maxResults - results.length),
      languageCode: 'es',
    };

    if (pageToken) {
      body.pageToken = pageToken;
    } else if (center) {
      body.locationBias = {
        circle: {
          center: { latitude: center.lat, longitude: center.lng },
          radius: Math.min((params.radiusKm ?? 15) * 1000, 50000),
        },
      };
    }

    const res = await fetch(`${PLACES_BASE}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Places API error (${res.status}): ${errText}`);
    }

    const data: SearchTextResponse = await res.json();
    for (const place of data.places ?? []) {
      results.push(rawPlaceToBusiness(place));
    }

    pageToken = data.nextPageToken;
    if (pageToken && results.length < maxResults) {
      // La API requiere unos segundos antes de que el pageToken sea válido.
      await new Promise((r) => setTimeout(r, 2000));
    } else {
      pageToken = undefined;
    }
  } while (pageToken && results.length < maxResults);

  return results.slice(0, maxResults);
}
