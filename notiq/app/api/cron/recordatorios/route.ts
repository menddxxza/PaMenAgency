import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { enviarPush, pushConfigurado } from '@/lib/push';
import webpush from 'web-push';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Cron de recordatorios (vercel.json → una vez al día). Manda un push por cada
 * tarea con `recordar_el` ya cumplido y sin enviar todavía, a cada dispositivo
 * donde el usuario haya activado las notificaciones.
 *
 * Una vez al día y no cada pocos minutos porque el plan Hobby de Vercel no deja
 * programar crons con más frecuencia que diaria — si el proyecto pasa a Pro
 * algún día, cambiar el "schedule" de vercel.json es lo único que hace falta
 * para que los avisos lleguen más cerca de la hora exacta.
 *
 * Protegido con CRON_SECRET: Vercel manda ese mismo valor en el header
 * Authorization cuando dispara el cron (lo añade solo, a partir de la variable
 * de entorno) — sin él, cualquiera podría llamar a esta ruta y vaciar la cola
 * de recordatorios pendientes sin que le tocara todavía.
 */
export async function GET(request: NextRequest) {
  const secreto = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || secreto !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  if (!pushConfigurado()) {
    return NextResponse.json({ enviados: 0, motivo: 'Notificaciones push no configuradas.' });
  }

  const sql = db();

  // estado != 'hecha': recordar algo que ya se ha completado no aporta nada.
  const pendientes = await sql<{ id: string; user_id: string; titulo: string }[]>`
    select id, user_id, titulo from tasks
    where recordar_el is not null and recordar_el <= now()
      and recordatorio_enviado_el is null and estado != 'hecha'
    limit 200
  `;

  let enviados = 0;

  for (const tarea of pendientes) {
    const suscripciones = await sql<{ endpoint: string; p256dh: string; auth: string }[]>`
      select endpoint, p256dh, auth from push_subscriptions where user_id = ${tarea.user_id}::uuid
    `;

    // Sin ningún dispositivo suscrito, se marca igual como enviado: no hay a
    // quién avisar, y sin esto el cron reintentaría esta misma tarea cada día
    // para siempre en vez de una sola vez.
    let algunaEntregada = suscripciones.length === 0;

    for (const suscripcion of suscripciones) {
      try {
        await enviarPush(
          { endpoint: suscripcion.endpoint, keys: { p256dh: suscripcion.p256dh, auth: suscripcion.auth } },
          { titulo: 'Recordatorio de Notiq', cuerpo: tarea.titulo, url: '/tareas' },
        );
        algunaEntregada = true;
        enviados++;
      } catch (fallo) {
        // 404/410: el navegador dice que esa suscripción ya no existe (permiso
        // revocado, perfil borrado...) — se borra para no reintentar contra
        // algo muerto en cada pasada del cron.
        if (fallo instanceof webpush.WebPushError && (fallo.statusCode === 404 || fallo.statusCode === 410)) {
          await sql`delete from push_subscriptions where endpoint = ${suscripcion.endpoint}`;
        } else {
          console.error('[notiq] fallo enviando un push', fallo);
        }
      }
    }

    if (algunaEntregada) {
      await sql`update tasks set recordatorio_enviado_el = now() where id = ${tarea.id}::uuid`;
    }
  }

  return NextResponse.json({ enviados, revisadas: pendientes.length });
}
