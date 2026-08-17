'use server';

import { getSesion } from '@/lib/sesion';
import { db } from '@/lib/db';
import { consumoIa, puedeCrearNota } from '@/lib/ia/limites';
import { stripeConfigurado } from '@/lib/stripe';

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

  return {
    email: sesion.email,
    plan: sesion.plan,
    consumo,
    cupoNotas,
    perfil: filas[0] ?? null,
    pagosActivos: stripeConfigurado(),
  };
}
