'use server';

import { getSesion } from '@/lib/sesion';
import { db } from '@/lib/db';
import { pushConfigurado } from '@/lib/push';

export type Resultado = { ok: true } | { ok: false; error: string };

export async function notificacionesConfiguradas(): Promise<boolean> {
  return pushConfigurado();
}

/**
 * Guarda (o actualiza, si el navegador ya tenía una suscripción con este mismo
 * endpoint) la suscripción push de este dispositivo. `endpoint` lo asigna el
 * navegador y ya es único por dispositivo+navegador — no hace falta generar
 * nada aparte para identificarlo.
 */
export async function guardarSuscripcionPush(suscripcion: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };

  const { endpoint, keys } = suscripcion;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return { ok: false, error: 'Suscripción no válida.' };
  }

  const sql = db();
  try {
    await sql`
      insert into push_subscriptions (user_id, endpoint, p256dh, auth)
      values (${sesion.userId}::uuid, ${endpoint}, ${keys.p256dh}, ${keys.auth})
      on conflict (endpoint) do update
        set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth
    `;
  } catch (fallo) {
    console.error('[notiq] no se ha podido guardar la suscripción push', fallo);
    return { ok: false, error: 'No se ha podido activar.' };
  }

  return { ok: true };
}

export async function borrarSuscripcionPush(endpoint: string): Promise<Resultado> {
  const sesion = await getSesion();
  if (!sesion) return { ok: false, error: 'Sesión caducada.' };

  const sql = db();
  try {
    await sql`
      delete from push_subscriptions where endpoint = ${endpoint} and user_id = ${sesion.userId}::uuid
    `;
  } catch (fallo) {
    console.error('[notiq] no se ha podido borrar la suscripción push', fallo);
    return { ok: false, error: 'No se ha podido desactivar.' };
  }

  return { ok: true };
}
