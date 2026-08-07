import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { comoPlan, type Plan } from '@/lib/planes';

export type Sesion = {
  userId: string;
  email: string | null;
  plan: Plan;
};

/**
 * Correos con acceso Team gratis, sin pasar por Stripe — pensado para el propio
 * dueño de la app. Va por variable de entorno (lista separada por comas) y no
 * hardcodeado en el código a propósito: un email de una persona real no debería
 * quedar escrito en el historial de git de un repositorio, y así se puede
 * cambiar sin tocar código ni desplegar de nuevo. Se configura en `.env.local`
 * (no se sube) y, para que funcione en producción, en las variables de entorno
 * del despliegue.
 */
function esCorreoAdmin(email: string | null): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

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

  const email = sesion.user.email ?? null;

  return {
    userId: sesion.user.id,
    email,
    // Se resuelve aquí y no en cada sitio que usa sesion.plan: así la cuota de
    // IA, el límite de notas y los botones de Stripe respetan el acceso admin
    // sin tener que acordarse de comprobarlo en cada uno por separado.
    plan: esCorreoAdmin(email) ? 'team' : comoPlan(usuario.plan),
  };
}
