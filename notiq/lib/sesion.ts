import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { comoPlan, type Plan } from '@/lib/planes';

export type Sesion = {
  userId: string;
  email: string | null;
  plan: Plan;
};

/**
 * Sesión + plan del usuario actual, o null si no ha iniciado sesión.
 *
 * El plan se lee de la base de datos en cada llamada, no del JWT de la sesión: el
 * JWT solo se renueva al iniciar sesión (o cuando expira), así que si viviera ahí,
 * alguien que acabara de pasar a Pro seguiría viendo los límites de Free hasta
 * volver a entrar. Un select de más por petición es barato comparado con esa
 * confusión.
 */
export async function getSesion(): Promise<Sesion | null> {
  const sesion = await auth();
  if (!sesion?.user?.id) return null;

  const sql = db();
  const [usuario] = await sql<{ plan: string }[]>`
    select plan from users where id = ${sesion.user.id}::uuid
  `;
  if (!usuario) return null;

  return {
    userId: sesion.user.id,
    email: sesion.user.email ?? null,
    plan: comoPlan(usuario.plan),
  };
}
