import { NextResponse, type NextRequest } from 'next/server';
import { getSesion } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

/**
 * Abre el portal de facturación de Stripe: cambiar de tarjeta, ver facturas y
 * cancelar la suscripción. Todo eso lo gestiona Stripe; nosotros solo nos enteramos
 * por el webhook.
 */
export async function POST(request: NextRequest) {
  const sesion = await getSesion();
  if (!sesion) {
    return NextResponse.json({ error: 'Sesión caducada. Vuelve a entrar.' }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: 'Los pagos no están configurados en este despliegue.' },
      { status: 503 },
    );
  }

  const { data: perfil } = await sesion.supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', sesion.userId)
    .maybeSingle();

  if (!perfil?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'Todavía no tienes ninguna suscripción que gestionar.' },
      { status: 400 },
    );
  }

  const sitio = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: perfil.stripe_customer_id,
      return_url: `${sitio}/ajustes`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (fallo) {
    console.error('[notiq] fallo al abrir el portal de facturación', fallo);
    return NextResponse.json(
      { error: 'No se ha podido abrir el portal. Inténtalo de nuevo.' },
      { status: 502 },
    );
  }
}
