'use server';

import { createClient } from '@/lib/supabase/server';
import { avisarDenuncia } from '@/lib/email';
import { excedeLimite } from '@/lib/security/rate-limit';

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

  // Sin esto, una cuenta podía llamar a esta acción en bucle: cada llamada
  // manda un email de verdad (vía Resend), así que sin tope esto es tanto
  // una vía para acosar a un vendedor a base de denuncias falsas como una
  // forma de agotar la cuota de envío que comparten leads, reseñas, alertas
  // y destacados. Server Action, no Route Handler — no hay IP a mano, así
  // que la clave es la propia cuenta.
  if (excedeLimite(`denuncia:${user.id}`, 5, 10 * 60_000)) {
    return { ok: false, error: 'Demasiadas denuncias seguidas. Prueba de nuevo más tarde.' };
  }

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
