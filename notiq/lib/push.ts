import webpush from 'web-push';

/**
 * Notificaciones push del navegador (Web Push, el estándar que también usan
 * las PWA de Android/desktop) — no es Expo Notifications ni ningún SDK de
 * terceros: solo el par de claves VAPID que identifica a Notiq como remitente
 * ante el navegador de cada usuario. Se generan una vez (`npx web-push
 * generate-vapid-keys` o `webpush.generateVAPIDKeys()`) y no caducan ni
 * dependen de ninguna cuenta externa — a diferencia de Stripe o Groq, no hay
 * dashboard donde sacarlas: son solo un par de claves criptográficas propias.
 */

let configurado = false;

function asegurarConfigurado(): void {
  if (configurado) return;

  const publica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privada = process.env.VAPID_PRIVATE_KEY;
  if (!publica || !privada) {
    throw new Error('VAPID no está configurado en este despliegue.');
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:pabloangelmendoza82@gmail.com',
    publica,
    privada,
  );
  configurado = true;
}

export function pushConfigurado(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export type SuscripcionPush = { endpoint: string; keys: { p256dh: string; auth: string } };

/** Lanza si el navegador responde que la suscripción ya no existe (permiso
 * revocado, navegador desinstalado…): quien llama decide qué hacer con eso
 * (en el cron, borrar la fila). */
export async function enviarPush(
  suscripcion: SuscripcionPush,
  payload: { titulo: string; cuerpo: string; url?: string },
): Promise<void> {
  asegurarConfigurado();
  await webpush.sendNotification(suscripcion, JSON.stringify(payload));
}
