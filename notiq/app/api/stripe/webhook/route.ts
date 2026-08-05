import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { daDerechoAlPlan, getStripe, planDesdePrecio } from '@/lib/stripe';

export const runtime = 'nodejs';
// El cuerpo tiene que llegar tal cual para poder validar la firma: cualquier
// reserialización (aunque produzca un JSON equivalente) la invalida.
export const dynamic = 'force-dynamic';

/**
 * Única fuente de verdad del plan de un usuario.
 *
 * Nada más en la aplicación escribe `profiles.plan`: el resto solo lo lee. El
 * trigger `proteger_plan` de la migración se encarga de que así sea incluso si
 * alguien se equivoca, porque solo la service role key puede saltárselo.
 *
 * Configurar en Stripe (Developers → Webhooks → Add endpoint):
 *   URL: https://<dominio>/api/stripe/webhook
 *   Eventos: checkout.session.completed, customer.subscription.created,
 *            customer.subscription.updated, customer.subscription.deleted
 * y copiar el signing secret a STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secreto = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secreto) {
    console.error('[notiq] webhook de Stripe recibido sin configuración');
    return NextResponse.json({ error: 'Webhook no configurado.' }, { status: 503 });
  }

  const firma = request.headers.get('stripe-signature');
  const cuerpo = await request.text();

  let evento: Stripe.Event;
  try {
    evento = await stripe.webhooks.constructEventAsync(cuerpo, firma ?? '', secreto);
  } catch (fallo) {
    // Sin firma válida no se toca nada: este endpoint es público, y sin esta
    // comprobación cualquiera podría regalarse el plan Team con un curl.
    console.warn('[notiq] firma de webhook inválida', fallo);
    return NextResponse.json({ error: 'Firma inválida.' }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    // 500 y no 200: así Stripe reintenta cuando se arregle la configuración, en
    // lugar de dar el evento por procesado y perder el alta.
    console.error('[notiq] falta SUPABASE_SERVICE_ROLE_KEY para procesar el webhook');
    return NextResponse.json({ error: 'Servidor mal configurado.' }, { status: 500 });
  }

  try {
    switch (evento.type) {
      case 'checkout.session.completed': {
        const sesion = evento.data.object;
        if (!sesion.subscription) break;

        // La sesión de checkout no trae los items de la suscripción, así que hay
        // que pedirla entera para saber qué precio se ha contratado.
        const suscripcion = await stripe.subscriptions.retrieve(
          typeof sesion.subscription === 'string' ? sesion.subscription : sesion.subscription.id,
        );
        await sincronizar(admin, suscripcion, sesion.client_reference_id);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await sincronizar(admin, evento.data.object);
        break;
      }

      default:
        // El resto de eventos (invoice.*, payment_intent.*…) no cambian el plan.
        break;
    }
  } catch (fallo) {
    // Devolver 500 hace que Stripe reintente con backoff durante 3 días. Es
    // preferible a tragarse el error: un usuario que ha pagado y se queda en Free
    // escribe a soporte, y para entonces el evento ya no se puede recuperar.
    console.error(`[notiq] fallo procesando ${evento.type}`, fallo);
    return NextResponse.json({ error: 'Error procesando el evento.' }, { status: 500 });
  }

  return NextResponse.json({ recibido: true });
}

/**
 * Vuelca el estado de una suscripción de Stripe sobre el perfil.
 *
 * Todos los caminos acaban aquí, incluido el de la baja: si la suscripción ya no da
 * derecho a nada, el plan vuelve a 'free'. Es idempotente a propósito, porque Stripe
 * reenvía eventos y puede entregarlos desordenados.
 */
async function sincronizar(
  admin: SupabaseClient,
  suscripcion: Stripe.Subscription,
  userIdDeLaSesion?: string | null,
): Promise<void> {
  // El user_id viaja en la metadata que puso el checkout. Si falta (una
  // suscripción creada a mano desde el dashboard, por ejemplo), se cae al
  // client_reference_id y por último al customer.
  const userId = suscripcion.metadata?.user_id ?? userIdDeLaSesion ?? null;
  const customerId =
    typeof suscripcion.customer === 'string' ? suscripcion.customer : suscripcion.customer.id;

  const precio = suscripcion.items.data[0]?.price?.id;
  const planContratado = planDesdePrecio(precio);

  if (!planContratado) {
    // Un precio que no reconocemos casi siempre significa que STRIPE_PRICE_* está
    // mal configurado. Bajar a Free a alguien que acaba de pagar sería peor, así
    // que se deja el plan como está y se avisa.
    console.error(
      `[notiq] precio desconocido ${precio} en la suscripción ${suscripcion.id}; revisa STRIPE_PRICE_PRO y STRIPE_PRICE_TEAM`,
    );
    return;
  }

  const activa = daDerechoAlPlan(suscripcion.status);
  const plan = activa ? planContratado : 'free';

  // `current_period_end` vive en el item de la suscripción desde la API 2025-03.
  const finDePeriodo = suscripcion.items.data[0]?.current_period_end;

  const cambios = {
    plan,
    stripe_customer_id: customerId,
    stripe_subscription_id: activa ? suscripcion.id : null,
    subscription_status: suscripcion.status,
    plan_renueva_el: finDePeriodo ? new Date(finDePeriodo * 1000).toISOString() : null,
  };

  // Por user_id cuando se sabe; si no, por customer, que es lo único que queda en
  // los eventos de una suscripción creada fuera del checkout.
  const actualizacion = admin.from('profiles').update(cambios, { count: 'exact' });
  const { error, count } = await (userId
    ? actualizacion.eq('id', userId)
    : actualizacion.eq('stripe_customer_id', customerId));

  if (error) throw error;

  if (!count) {
    // Ninguna fila actualizada: el perfil no existe o el customer no está enlazado.
    // Se lanza para que Stripe reintente, por si es una carrera con el alta.
    throw new Error(
      `no se ha encontrado el perfil para la suscripción ${suscripcion.id} (user_id: ${userId ?? 'null'}, customer: ${customerId})`,
    );
  }
}
