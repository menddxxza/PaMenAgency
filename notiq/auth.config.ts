import type { NextAuthConfig } from 'next-auth';

/**
 * Configuración "segura para el Edge": sin providers (el de credenciales llama a
 * `db()`, que usa sockets TCP — no funciona en el runtime de Edge donde corre el
 * middleware). Solo la lógica de qué rutas exigen sesión.
 *
 * `lib/auth.ts` añade encima los providers de verdad para usar en Server
 * Components y Route Handlers (runtime de Node). Es el patrón que documenta
 * Auth.js para Next.js middleware con un provider que toca base de datos.
 */
const RUTAS_PRIVADAS = ['/notas', '/tareas', '/asistente', '/ajustes'];

export const authConfig = {
  pages: { signIn: '/entrar' },
  providers: [],
  session: { strategy: 'jwt' },
  // Fuera de Vercel (que lo detecta solo) Auth.js rechaza en producción
  // cualquier host que no reconozca explícitamente — es una protección contra
  // ataques de Host header cuando la app corre detrás de un proxy que no se
  // controla. Aquí el proxy sí se controla (es el propio despliegue), así que se
  // confía en el host que llega.
  trustHost: true,
  callbacks: {
    authorized({ auth, request }) {
      const ruta = request.nextUrl.pathname;
      const esPrivada = RUTAS_PRIVADAS.some((r) => ruta === r || ruta.startsWith(`${r}/`));
      const conectado = Boolean(auth?.user);

      if (esPrivada && !conectado) {
        // Devolver `false` aquí dispara el redirect por defecto de Auth.js, que usa
        // su propio parámetro `callbackUrl` — pero entrar/actions.ts y
        // FormularioAcceso.tsx esperan `volver`. Se construye el redirect a mano
        // para que los dos lados hablen el mismo parámetro.
        const destino = new URL('/entrar', request.nextUrl.origin);
        destino.searchParams.set('volver', ruta + request.nextUrl.search);
        return Response.redirect(destino);
      }

      if (conectado && ruta === '/entrar') {
        return Response.redirect(new URL('/notas', request.nextUrl.origin));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
