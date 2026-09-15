'use server';

import { getSesion } from '@/lib/sesion';
import { db } from '@/lib/db';
import { consumoIa, puedeCrearNota } from '@/lib/ia/limites';
import { getStripe, stripeConfigurado } from '@/lib/stripe';

/** Todo lo que pinta la pestaña de Ajustes, en una sola llamada desde el cliente. */
export async function obtenerAjustes() {
  const sesion = await getSesion();
  if (!sesion) return null;

  const sql = db();
  const [consumo, cupoNotas, filas] = await Promise.all([
    consumoIa(sesion.userId, sesion.plan),
    puedeCrearNota(sesion.userId, sesion.plan),
    sql<
      {
        stripe_customer_id: string | null;
        stripe_subscription_id: string | null;
        subscription_status: string | null;
        plan_renueva_el: string | null;
      }[]
    >`
      select stripe_customer_id, stripe_subscription_id, subscription_status, plan_renueva_el
      from users where id = ${sesion.userId}::uuid
    `,
  ]);

  const perfil = filas[0] ?? null;

  // El número de personas por las que se paga Team no se guarda en Neon — vive
  // en la propia suscripción de Stripe (line_items[0].quantity), que ya es la
  // fuente de verdad del plan y del precio. Pedirlo aquí en caliente evita una
  // columna nueva (y otra migración) solo para reflejar lo que Stripe ya sabe.
  let asientosTeam: number | null = null;
  if (sesion.plan === 'team' && perfil?.stripe_subscription_id) {
    const stripe = getStripe();
    if (stripe) {
      try {
        const suscripcion = await stripe.subscriptions.retrieve(perfil.stripe_subscription_id);
        asientosTeam = suscripcion.items.data[0]?.quantity ?? null;
      } catch (fallo) {
        console.error('[notiq] no se ha podido leer la cantidad de la suscripción', fallo);
      }
    }
  }

  return {
    email: sesion.email,
    plan: sesion.plan,
    consumo,
    cupoNotas,
    perfil,
    asientosTeam,
    pagosActivos: stripeConfigurado(),
  };
}
