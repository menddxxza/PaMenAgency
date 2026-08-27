import { NextResponse, type NextRequest } from 'next/server';

/**
 * Candado temporal de sitio completo. Si SITE_LOCK_PASSWORD está configurada,
 * toda la web pide usuario/contraseña (HTTP Basic Auth) antes de servir nada.
 * Sin esa variable de entorno, no cambia nada respecto a antes.
 */
function candadoDeSitio(request: NextRequest): NextResponse | null {
  const clave = process.env.SITE_LOCK_PASSWORD;
  if (!clave) return null;

  const cabecera = request.headers.get('authorization');
  if (cabecera?.startsWith('Basic ')) {
    const decodificado = atob(cabecera.slice('Basic '.length));
    const password = decodificado.split(':').slice(1).join(':');
    if (password === clave) return null;
  }

  return new NextResponse('Acceso restringido', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="IAPyme"' },
  });
}

// El middleware corre siempre en el Edge Runtime de Vercel (no se puede elegir
// para middleware.ts en Next 14). Se comprobó en producción que, desde ese
// entorno concreto, cualquier llamada de red a Supabase Auth se queda colgada
// sin resolverse nunca — ni con el SDK ni con un fetch manual con
// AbortController — mientras que la misma llamada desde fuera (curl) o desde
// una función Node.js normal responde en milisegundos. Por eso el middleware
// ya NO verifica la sesión contra Supabase: solo hace el candado de sitio
// (que no necesita red). La comprobación real de sesión para /dashboard y
// /admin vive en sus propios layout/page (Server Components, runtime Node.js),
// que ya redirigen a /entrar si no hay sesión — ver app/dashboard/layout.tsx
// y app/admin/*/page.tsx.
export function middleware(request: NextRequest) {
  const bloqueado = candadoDeSitio(request);
  if (bloqueado) return bloqueado;

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
