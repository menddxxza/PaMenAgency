import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

/**
 * Usa `authConfig` (sin providers) y no `lib/auth.ts`: el middleware corre en el
 * runtime de Edge, que no soporta los sockets TCP que necesita `db()` para hablar
 * con Neon. Toda la lógica de qué rutas exigen sesión vive en
 * `authConfig.callbacks.authorized`.
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)'],
  // Auth.js tira de `jose` para el JWT de sesión, que usa DecompressionStream — no
  // disponible en el runtime Edge (donde corre el middleware por defecto). El
  // runtime Node.js para middleware es estable desde Next.js 15.5; con esto el
  // build deja de avisar de una API no soportada y no hay que confiar en que ese
  // camino nunca se ejercite en producción.
  runtime: 'nodejs',
};
