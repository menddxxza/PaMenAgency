'use server';

import { createClient } from '@/lib/supabase/server';
import { avisarDenuncia } from '@/lib/email';

export type ResultadoDenuncia = { ok: true } | { ok: false; error: string };

const MOTIVOS = ['estafa', 'inapropiado', 'falsos', 'spam', 'otro'] as const;

/**
 * Reporta una ficha ya publicada a moderación. No cambia nada por sí sola
 * (no la oculta ni la archiva): solo avisa al admin por email, igual que
 * `solicitarDestacado`. Exige sesión — no por desconfianza del anónimo, sino
 * porque sin eso no hay forma de frenar un bombardeo de denuncias falsas
 * contra un vendedor que le caiga mal a alguien.
 */
export async function denunciarFicha(
  productId: string,
  motivo: string,
  detalleBruto: string,
): Promise<ResultadoDenuncia> {
  const supabase = createClient();
  if (!supabase) return { ok: false, error: 'La base de datos no está configurada.' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Tienes que iniciar sesión para denunciar una ficha.' };

  if (!MOTIVOS.includes(motivo as (typeof MOTIVOS)[number])) {
    return { ok: false, error: 'Elige un motivo.' };
  }

  const { data: producto } = await supabase
    .from('products')
    .select('titulo, slug')
    .eq('id', productId)
    .maybeSingle();

  if (!producto) return { ok: false, error: 'Esa ficha ya no existe.' };

  await avisarDenuncia({
    titulo: producto.titulo,
    slug: producto.slug,
    motivo,
    detalle: detalleBruto.trim().slice(0, 1000),
    denuncianteEmail: user.email ?? 'desconocido',
  });

  return { ok: true };
}
