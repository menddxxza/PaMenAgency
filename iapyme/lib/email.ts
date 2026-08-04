import { Resend } from 'resend';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iapyme.es';

/**
 * Aviso al admin de que hay algo esperando en la cola de moderación. Si no hay
 * Resend configurado, no falla: solo deja constancia en los logs. La moderación
 * en sí no depende de este email, es un aviso de cortesía.
 */
export async function avisarNuevaRevision(producto: { titulo: string; vendedor: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const destino = process.env.ADMIN_EMAIL;

  if (!apiKey || !destino) {
    console.info('[email] Resend no configurado, aviso omitido:', producto.titulo);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'IAPyme <onboarding@resend.dev>',
      to: destino,
      subject: `Nueva ficha en revisión: ${producto.titulo}`,
      html: `
        <p><b>${producto.vendedor}</b> ha enviado <b>${producto.titulo}</b> a revisión.</p>
        <p><a href="${SITE_URL}/admin">Revisarla ahora →</a></p>
      `,
    });
  } catch (error) {
    // Un fallo de email nunca debe tumbar el envío a revisión del vendedor.
    console.error('[email] Error al avisar de nueva revisión:', error);
  }
}
