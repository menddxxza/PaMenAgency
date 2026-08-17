import { db } from '@/lib/db';
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
export async function consumirOperacionIa(userId: string, plan: Plan): Promise<ResultadoCuota> {
  const limite = limitesDe(plan).operacionesIaMes;
  const sql = db();

  let usadas: number;
  try {
    const [{ consumir_ia: total }] = await sql<{ consumir_ia: number }[]>`
      select consumir_ia(${userId}::uuid, ${periodoActual()}, ${limite})
    `;
    usadas = total;
  } catch (fallo) {
    // Si el contador falla no se puede saber si queda cuota. Se deja pasar la
    // operación: cobrar de más a un usuario legítimo es peor que regalar una
    // llamada de 0,0002 $, y el error queda en los logs.
    console.error('[notiq] no se ha podido consumir cuota de IA', fallo);
    return { permitido: true, usadas: 0, limite };
  }

  return usadas > limite
    ? { permitido: false, usadas: limite, limite }
    : { permitido: true, usadas, limite };
}

/** Lectura del consumo, para pintarlo en la interfaz. */
export async function consumoIa(userId: string, plan: Plan): Promise<{ usadas: number; limite: number }> {
  const limite = limitesDe(plan).operacionesIaMes;
  const sql = db();

  const [fila] = await sql<{ operaciones: number }[]>`
    select operaciones from ai_usage where user_id = ${userId}::uuid and periodo = ${periodoActual()}
  `;

  return { usadas: fila?.operaciones ?? 0, limite };
}

/**
 * Límite de notas del plan. A diferencia de la IA no hace falta atomicidad: pasarse
 * por una nota en una carrera no cuesta dinero.
 */
export async function puedeCrearNota(
  userId: string,
  plan: Plan,
): Promise<{ permitido: boolean; usadas: number; limite: number | null }> {
  const limite = limitesDe(plan).notas;
  if (limite === null) return { permitido: true, usadas: 0, limite: null };

  const sql = db();
  const [{ total }] = await sql<{ total: number }[]>`
    select count(*)::int as total from notes
    where user_id = ${userId}::uuid and deleted_at is null
  `;

  return { permitido: total < limite, usadas: total, limite };
}
