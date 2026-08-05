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
        await sincronizar(admin, suscripcion, evento.created, sesion.client_reference_id);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await sincronizar(admin, evento.data.object, evento.created);
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
 * derecho a nada, el plan vuelve a 'free'.
 *
 * Se lee el perfil antes de escribir (en vez de un único UPDATE con condiciones) para
 * poder distinguir "el perfil no existe" (hay que reintentar) de "el perfil existe
 * pero este evento no toca nada" (evento desordenado, o una baja de una suscripción
 * ya sustituida): son casos muy distintos y lanzar en el segundo dejaría a Stripe
 * reintentando 3 días un evento que nunca va a aplicarse. Queda una ventana no
 * atómica entre la lectura y la escritura si dos entregas del mismo evento llegan en
 * el mismo instante; es un caso mucho más raro que el que esto arregla (un reintento
 * tardío llegando después de un evento más nuevo) y el propio mecanismo de reintento
 * de Stripe lo autocorrige en la siguiente entrega.
 */
async function sincronizar(
  admin: SupabaseClient,
  suscripcion: Stripe.Subscription,
  eventoCreado: number,
  userIdDeLaSesion?: string | null,
): Promise<void> {
  // El user_id viaja en la metadata que puso el checkout. Si falta (una
  // suscripción creada a mano desde el dashboard, por ejemplo), se cae al
  // client_reference_id y por último al customer.
  const userId = suscripcion.metadata?.user_id ?? userIdDeLaSesion ?? null;
  const customerId =
    typeof suscripcion.customer === 'string' ? suscripcion.customer : suscripcion.customer.id;
  const columna = userId ? 'id' : 'stripe_customer_id';
  const valor = userId ?? customerId;

  const { data: perfil, error: errorLectura } = await admin
    .from('profiles')
    .select('stripe_evento_en, stripe_subscription_id')
    .eq(columna, valor)
    .maybeSingle();

  if (errorLectura) throw errorLectura;

  if (!perfil) {
    // Puede ser una carrera con el alta (el checkout llega antes de que el
    // trigger de auth.users termine de crear el perfil): se reintenta.
    throw new Error(
      `no se ha encontrado el perfil para la suscripción ${suscripcion.id} (user_id: ${userId ?? 'null'}, customer: ${customerId})`,
    );
  }

  // Stripe no garantiza el orden de entrega y reintenta los fallos hasta 3 días.
  // Si ya hay anotado un evento igual o más nuevo, este no debe pisarlo.
  if (perfil.stripe_evento_en !== null && perfil.stripe_evento_en >= eventoCreado) return;

  const activa = daDerechoAlPlan(suscripcion.status);
  const precio = suscripcion.items.data[0]?.price?.id;
  const planContratado = planDesdePrecio(precio);

  if (activa && !planContratado) {
    // Un precio que no reconocemos en una suscripción que sigue dando derecho a
    // plan casi siempre significa que STRIPE_PRICE_* está mal configurado. Bajar
    // a Free a alguien que acaba de pagar sería peor, así que se deja el plan
    // como está y se avisa. Si la suscripción ya NO está activa (cancelada,
    // impagada del todo…) no hace falta resolver el precio para saber que hay
    // que bajar a Free, así que ese caso no entra aquí.
    console.error(
      `[notiq] precio desconocido ${precio} en la suscripción ${suscripcion.id}; revisa STRIPE_PRICE_PRO y STRIPE_PRICE_TEAM`,
    );
    return;
  }

  if (!activa && perfil.stripe_subscription_id && perfil.stripe_subscription_id !== suscripcion.id) {
    // La baja es de una suscripción distinta a la que el perfil tiene anotada
    // ahora mismo: por ejemplo, la suscripción vieja de un cambio de plan de
    // antes de que existiera `cambiarDePlan` en checkout/route.ts. La que sigue
    // activa no debe tocarse porque se cierre una que ya no es la vigente.
    return;
  }

  const plan = activa && planContratado ? planContratado : 'free';
  // `current_period_end` vive en el item de la suscripción desde la API 2025-03.
  const finDePeriodo = suscripcion.items.data[0]?.current_period_end;

  const { error } = await admin
    .from('profiles')
    .update({
      plan,
      stripe_customer_id: customerId,
      stripe_subscription_id: activa ? suscripcion.id : null,
      subscription_status: suscripcion.status,
      plan_renueva_el: finDePeriodo && activa ? new Date(finDePeriodo * 1000).toISOString() : null,
      stripe_evento_en: eventoCreado,
    })
    .eq(columna, valor);

  if (error) throw error;
}
