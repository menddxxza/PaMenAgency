import { Resend } from 'resend';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iapyme.es';

/** Estos avisos incrustan texto libre de comprador o vendedor en HTML. */
function escapeHtml(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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
        <p><b>${escapeHtml(producto.vendedor)}</b> ha enviado
        <b>${escapeHtml(producto.titulo)}</b> a revisión.</p>
        <p><a href="${SITE_URL}/admin">Revisarla ahora →</a></p>
      `,
    });
  } catch (error) {
    // Un fallo de email nunca debe tumbar el envío a revisión del vendedor.
    console.error('[email] Error al avisar de nueva revisión:', error);
  }
}

/**
 * Aviso al vendedor de que le ha llegado un lead nuevo. Igual que el de arriba:
 * si falla o no hay Resend, no debe tumbar el envío del formulario del comprador.
 */
export async function avisarNuevoLead(datos: {
  sellerEmail: string;
  tituloProducto: string;
  nombreComprador: string;
  mensaje: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info('[email] Resend no configurado, aviso de lead omitido:', datos.tituloProducto);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'IAPyme <onboarding@resend.dev>',
      to: datos.sellerEmail,
      subject: `Nuevo interesado en ${datos.tituloProducto}`,
      html: `
        <p><b>${escapeHtml(datos.nombreComprador)}</b> quiere saber más de
        <b>${escapeHtml(datos.tituloProducto)}</b>:</p>
        <p>"${escapeHtml(datos.mensaje)}"</p>
        <p><a href="${SITE_URL}/dashboard/leads">Ver en tu panel →</a></p>
      `,
    });
  } catch (error) {
    console.error('[email] Error al avisar de nuevo lead:', error);
  }
}

/**
 * Aviso de una alerta guardada: "esto que buscabas ya está publicado". Lo
 * dispara el cron diario, nunca una acción del usuario, así que aquí no hay
 * nada que no deba tumbarse si Resend falla — solo se pierde ese aviso.
 */
export async function avisarAlertaCoincidencias(datos: {
  destinatario: string;
  descripcionAlerta: string;
  publicaciones: { titulo: string; slug: string }[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info('[email] Resend no configurado, aviso de alerta omitido.');
    return;
  }

  const items = datos.publicaciones
    .map((p) => `<li><a href="${SITE_URL}/p/${p.slug}">${escapeHtml(p.titulo)}</a></li>`)
    .join('');

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'IAPyme <onboarding@resend.dev>',
      to: datos.destinatario,
      subject: `Nuevo en tu alerta: ${datos.descripcionAlerta}`,
      html: `
        <p>Hay ${datos.publicaciones.length === 1 ? 'una publicación nueva' : `${datos.publicaciones.length} publicaciones nuevas`}
        que coinciden con tu alerta <b>${escapeHtml(datos.descripcionAlerta)}</b>:</p>
        <ul>${items}</ul>
        <p><a href="${SITE_URL}/dashboard/alertas">Gestionar mis alertas →</a></p>
      `,
    });
  } catch (error) {
    console.error('[email] Error al avisar de alerta:', error);
  }
}

/**
 * Aviso de que ha llegado un mensaje dentro de una conversación ya abierta
 * (a diferencia de `avisarNuevoLead`, que es el primer contacto). Lo dispara
 * `enviarMensaje` tanto si escribe el vendedor como si escribe el comprador,
 * así que nunca debe tumbar el envío del mensaje si falla.
 */
export async function avisarNuevoMensaje(datos: {
  destinatario: string;
  nombreRemitente: string;
  cuerpo: string;
  leadId: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info('[email] Resend no configurado, aviso de mensaje omitido.');
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'IAPyme <onboarding@resend.dev>',
      to: datos.destinatario,
      subject: `Nuevo mensaje de ${datos.nombreRemitente}`,
      html: `
        <p><b>${escapeHtml(datos.nombreRemitente)}</b> te ha escrito:</p>
        <p>"${escapeHtml(datos.cuerpo)}"</p>
        <p><a href="${SITE_URL}/dashboard/leads/${datos.leadId}">Responder →</a></p>
      `,
    });
  } catch (error) {
    console.error('[email] Error al avisar de nuevo mensaje:', error);
  }
}

/** Aviso al vendedor de que le han dejado una reseña nueva. */
export async function avisarNuevaResena(datos: {
  sellerEmail: string;
  tituloProducto: string;
  puntuacion: number;
  comentario: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info('[email] Resend no configurado, aviso de reseña omitido:', datos.tituloProducto);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'IAPyme <onboarding@resend.dev>',
      to: datos.sellerEmail,
      subject: `Nueva reseña (${datos.puntuacion}★) en ${datos.tituloProducto}`,
      html: `
        <p>Han valorado <b>${escapeHtml(datos.tituloProducto)}</b> con
        ${datos.puntuacion} de 5 estrellas:</p>
        <p>"${escapeHtml(datos.comentario)}"</p>
      `,
    });
  } catch (error) {
    console.error('[email] Error al avisar de nueva reseña:', error);
  }
}
