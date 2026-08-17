import type { DefaultSession } from 'next-auth';

/**
 * Auth.js no incluye el id del usuario en la sesión por defecto. Notiq lo necesita
 * en todas partes (cada consulta filtra por user_id), así que se amplía el tipo
 * aquí en vez de castear `session.user.id as string` en cada sitio que lo use.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}
