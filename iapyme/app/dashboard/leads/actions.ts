'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase';
import { avisarNuevoMensaje } from '@/lib/email';
import type { LeadStatus } from '@/lib/database.types';
import type { ResultadoAccion } from '@/app/dashboard/actions';

const ESTADOS: LeadStatus[] = ['new', 'contacted', 'converted', 'discarded'];

/** Postgres: 42P01 es "la tabla no existe" — falta ejecutar la migración 0006. */
const AVISO_SIN_TABLA =
  'La mensajería todavía no está activada en este proyecto. Pídele al administrador que ejecute la migración pendiente.';

export async function cambiarEstadoLead(id: string, status: LeadStatus) {
  if (!ESTADOS.includes(status)) return { ok: false as const, error: 'Estado inválido.' };

  const supabase = createClient();
  if (!supabase) return { ok: false as const, error: 'La base de datos no está configurada.' };

  // La política "el vendedor gestiona sus leads" es la que impide tocar leads ajenos.
  const { error } = await supabase.from('leads').update({ status }).eq('id', id);
  if (error) return { ok: false as const, error: 'No hemos podido actualizarlo.' };

  revalidatePath('/dashboard/leads');
  return { ok: true as const };
}

/**
 * Envía un mensaje dentro de la conversación de un lead, tanto si escribe el
 * vendedor como el comprador. Comprueba a mano que quien llama es una de las
 * dos partes — la política de RLS ya lo impediría, pero así el error que
 * recibe la persona es uno legible, no un fallo genérico de base de datos.
 */
export async function enviarMensaje(leadId: string, cuerpoBruto: string): Promise<ResultadoAccion> {
  const supabase = createClient();
  if (!supabase) return { ok: false, error: 'La base de datos no está configurada.' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Tienes que iniciar sesión.' };

  const cuerpo = cuerpoBruto.trim().slice(0, 4000);
  if (cuerpo.length < 1) return { ok: false, error: 'Escribe algo antes de enviar.' };

  const { data: lead } = await supabase
    .from('leads')
    .select('id, seller_id, buyer_id, email')
    .eq('id', leadId)
    .maybeSingle();

  if (!lead || (lead.seller_id !== user.id && lead.buyer_id !== user.id)) {
    return { ok: false, error: 'No tienes acceso a esta conversación.' };
  }

  const { error } = await supabase.from('lead_mensajes').insert({
    lead_id: leadId,
    autor_id: user.id,
    cuerpo,
  });

  if (error) {
    return { ok: false, error: error.code === '42P01' ? AVISO_SIN_TABLA : 'No se ha podido enviar el mensaje.' };
  }

  // Avisar por email a la otra parte. Un fallo aquí no debe deshacer el envío,
  // que ya está guardado: solo se pierde el aviso, no el mensaje.
  const { data: remitente } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle();
  const nombreRemitente = remitente?.display_name ?? 'Alguien';

  if (user.id === lead.seller_id) {
    // Escribe el vendedor: el email del comprador vive en el propio lead,
    // tal como lo dejó al preguntar (puede no tener cuenta).
    if (lead.email) {
      await avisarNuevoMensaje({ destinatario: lead.email, nombreRemitente, cuerpo, leadId });
    }
  } else {
    // Escribe el comprador: el vendedor sí es siempre un usuario registrado,
    // pero su email vive en auth, no en profiles.
    const admin = getServiceClient();
    if (admin) {
      const { data: vendedor } = await admin.auth.admin.getUserById(lead.seller_id);
      if (vendedor.user?.email) {
        await avisarNuevoMensaje({
          destinatario: vendedor.user.email,
          nombreRemitente,
          cuerpo,
          leadId,
        });
      }
    }
  }

  revalidatePath(`/dashboard/leads/${leadId}`);
  return { ok: true };
}

/**
 * Marca como leídos los mensajes que ha escrito la otra parte. Se llama sola
 * al abrir el hilo (ver `MarcarLeido.tsx`); si falla o la tabla no existe
 * todavía, no pasa nada visible — el hilo simplemente no se marca.
 */
export async function marcarConversacionLeida(leadId: string): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('lead_mensajes')
    .update({ leido_at: new Date().toISOString() })
    .eq('lead_id', leadId)
    .neq('autor_id', user.id)
    .is('leido_at', null);
}
