import { NextResponse, type NextRequest } from 'next/server';
import { getSesion } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { esPlanDePago, getStripe, precioDe } from '@/lib/stripe';

export const runtime = 'nodejs';

/**
 * Abre una sesión de Stripe Checkout para contratar Pro o Team.
 *
 * Devuelve la URL a la que redirige el cliente; el formulario de pago lo sirve
 * Stripe. Esta ruta NO toca `profiles.plan`: el plan solo lo escribe el webhook,
 * cuando Stripe confirma que el cobro ha salido. Si se marcara aquí, bastaría con
 * abrir el checkout y cerrarlo para tener Pro gratis.
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

  const cuerpo = (await request.json().catch(() => ({}))) as { plan?: unknown };
  if (!esPlanDePago(cuerpo.plan)) {
    return NextResponse.json({ error: 'Plan no válido.' }, { status: 400 });
  }

  const precio = precioDe(cuerpo.plan);
  if (!precio) {
    return NextResponse.json(
      { error: `Falta configurar el precio del plan ${cuerpo.plan}.` },
      { status: 503 },
    );
  }

  const sitio = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  try {
    const { data: perfil } = await sesion.supabase
      .from('profiles')
      .select('stripe_subscription_id, plan')
      .eq('id', sesion.userId)
      .maybeSingle();

    // Si ya hay una suscripción de pago activa, NO se abre un checkout nuevo:
    // stripe.checkout.sessions.create crearía una SEGUNDA suscripción sobre el
    // mismo customer sin cancelar la primera (Stripe no las fusiona solo porque
    // compartan cliente), y el usuario acabaría pagando las dos a la vez. En su
    // lugar se cambia el precio de la suscripción existente, con prorrateo.
    if (perfil?.stripe_subscription_id && esPlanDePago(perfil.plan) && perfil.plan !== cuerpo.plan) {
      return await cambiarDePlan(stripe, perfil.stripe_subscription_id, precio);
    }

    const clienteStripe = await customerDelUsuario(stripe, sesion);

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: clienteStripe,
      line_items: [{ price: precio, quantity: 1 }],
      success_url: `${sitio}/ajustes?pago=ok`,
      cancel_url: `${sitio}/ajustes?pago=cancelado`,
      client_reference_id: sesion.userId,
      // El webhook necesita saber de quién es esta suscripción. En
      // customer.subscription.* solo llega la suscripción, no la sesión de
      // checkout, así que el user_id tiene que viajar en su metadata.
      subscription_data: {
        metadata: { user_id: sesion.userId },
      },
      // Evita que alguien con dos pestañas abiertas acabe con dos suscripciones.
      allow_promotion_codes: true,
    });

    if (!checkout.url) {
      return NextResponse.json({ error: 'Stripe no ha devuelto una URL.' }, { status: 502 });
    }

    return NextResponse.json({ url: checkout.url });
  } catch (fallo) {
    console.error('[notiq] fallo al crear el checkout', fallo);
    return NextResponse.json(
      { error: 'No se ha podido abrir el pago. Inténtalo de nuevo.' },
      { status: 502 },
    );
  }
}

/**
 * Cambia de plan a un usuario que ya tiene una suscripción de pago activa,
 * actualizando el precio del item existente en vez de crear una suscripción nueva.
 *
 * No escribe `profiles.plan` aquí: como el resto del flujo de pago, eso lo hace
 * únicamente el webhook cuando le llega `customer.subscription.updated`.
 */
async function cambiarDePlan(
  stripe: NonNullable<ReturnType<typeof getStripe>>,
  subscriptionId: string,
  nuevoPrecio: string,
): Promise<NextResponse> {
  const suscripcionActual = await stripe.subscriptions.retrieve(subscriptionId);
  const item = suscripcionActual.items.data[0];

  if (!item) {
    return NextResponse.json(
      { error: 'No se ha podido leer tu suscripción actual. Escribe a soporte.' },
      { status: 502 },
    );
  }

  await stripe.subscriptions.update(subscriptionId, {
    items: [{ id: item.id, price: nuevoPrecio }],
    proration_behavior: 'create_prorations',
  });

  // Sin url: el cambio ya es efectivo, no hace falta redirigir a Stripe.
  return NextResponse.json({ cambiado: true });
}

/**
 * Devuelve el customer de Stripe del usuario, creándolo la primera vez.
 *
 * Se reutiliza siempre el mismo para que el historial de facturas no se parta en
 * varios clientes si alguien se da de baja y vuelve, y para que el portal de
 * facturación le enseñe todo junto.
 */
async function customerDelUsuario(
  stripe: NonNullable<ReturnType<typeof getStripe>>,
  sesion: NonNullable<Awaited<ReturnType<typeof getSesion>>>,
): Promise<string> {
  const { data: perfil } = await sesion.supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', sesion.userId)
    .maybeSingle();

  if (perfil?.stripe_customer_id) return perfil.stripe_customer_id;

  const creado = await stripe.customers.create({
    email: sesion.email ?? undefined,
    metadata: { user_id: sesion.userId },
  });

  // Se guarda ya, y no al llegar el webhook: si el usuario abre el checkout y lo
  // cierra, no llega ningún webhook, y el siguiente intento crearía otro customer.
  // Hace falta la service role key porque `stripe_customer_id` está protegido
  // contra escrituras desde una sesión de usuario — y el id que se escribe es el
  // de la sesión ya verificada, no algo que venga de la petición.
  const admin = createAdminClient();
  if (admin) {
    await admin
      .from('profiles')
      .update({ stripe_customer_id: creado.id })
      .eq('id', sesion.userId);
  } else {
    // Sin service role key el checkout sigue funcionando; solo se acumulan
    // customers huérfanos en Stripe si el usuario abandona el pago varias veces.
    console.warn('[notiq] sin SUPABASE_SERVICE_ROLE_KEY: no se guarda el customer de Stripe');
  }

  return creado.id;
}
