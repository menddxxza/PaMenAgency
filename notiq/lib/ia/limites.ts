import type { SupabaseClient } from '@supabase/supabase-js';
import { limitesDe, type Plan } from '@/lib/planes';

/**
 * Cuota de IA por plan y mes natural.
 *
 * El contador vive en `ai_usage`, una fila por usuario y mes (`periodo` = 'YYYY-MM').
 * Se incrementa con la función `consumir_ia`, que hace el upsert y el chequeo del
 * límite en la misma transacción: contar en JS y luego escribir deja una ventana en
 * la que dos peticiones simultáneas pasan las dos el último hueco de la cuota.
 */

export type ResultadoCuota =
  | { permitido: true; usadas: number; limite: number }
  | { permitido: false; usadas: number; limite: number };

export function periodoActual(fecha = new Date()): string {
  return `${fecha.getUTCFullYear()}-${String(fecha.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Reserva una operación de IA. Devuelve `permitido: false` si el plan ya no da más,
 * sin consumir nada.
 */
export async function consumirOperacionIa(
  supabase: SupabaseClient,
  userId: string,
  plan: Plan,
): Promise<ResultadoCuota> {
  const limite = limitesDe(plan).operacionesIaMes;

  const { data, error } = await supabase.rpc('consumir_ia', {
    p_usuario: userId,
    p_periodo: periodoActual(),
    p_limite: limite,
  });

  if (error) {
    // Si el contador falla no se puede saber si queda cuota. Se deja pasar la
    // operación: cobrar de más a un usuario legítimo es peor que regalar una
    // llamada de 0,0002 $, y el error queda en los logs de Supabase.
    console.error('[notiq] no se ha podido consumir cuota de IA', error);
    return { permitido: true, usadas: 0, limite };
  }

  const usadas = typeof data === 'number' ? data : 0;
  return usadas > limite
    ? { permitido: false, usadas: limite, limite }
    : { permitido: true, usadas, limite };
}

/** Lectura del consumo, para pintarlo en la interfaz. */
export async function consumoIa(
  supabase: SupabaseClient,
  userId: string,
  plan: Plan,
): Promise<{ usadas: number; limite: number }> {
  const limite = limitesDe(plan).operacionesIaMes;

  const { data } = await supabase
    .from('ai_usage')
    .select('operaciones')
    .eq('user_id', userId)
    .eq('periodo', periodoActual())
    .maybeSingle();

  return { usadas: data?.operaciones ?? 0, limite };
}

/**
 * Límite de notas del plan. A diferencia de la IA no hace falta atomicidad: pasarse
 * por una nota en una carrera no cuesta dinero.
 */
export async function puedeCrearNota(
  supabase: SupabaseClient,
  userId: string,
  plan: Plan,
): Promise<{ permitido: boolean; usadas: number; limite: number | null }> {
  const limite = limitesDe(plan).notas;
  if (limite === null) return { permitido: true, usadas: 0, limite: null };

  const { count } = await supabase
    .from('notes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('deleted_at', null);

  const usadas = count ?? 0;
  return { permitido: usadas < limite, usadas, limite };
}
