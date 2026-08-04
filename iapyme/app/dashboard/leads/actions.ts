'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { LeadStatus } from '@/lib/database.types';

const ESTADOS: LeadStatus[] = ['new', 'contacted', 'converted', 'discarded'];

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
