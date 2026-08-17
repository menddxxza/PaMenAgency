import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
// Ruta relativa a propósito, no el alias `@/`: en Vercel, con el proyecto
// viviendo en una subcarpeta del repositorio, el bundler del Edge Function
// del middleware no resolvía el alias y marcaba el módulo como "no soportado".
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigurado } from './lib/supabase/config';

/** Rutas que exigen sesión iniciada. */
const RUTAS_PRIVADAS = ['/dashboard', '/admin'];

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

export async function middleware(request: NextRequest) {
  const bloqueado = candadoDeSitio(request);
  if (bloqueado) return bloqueado;

  if (!supabaseConfigurado()) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() revalida el token contra Supabase; getSession() se fía de la cookie
  // y por eso no sirve para proteger rutas.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const esPrivada = RUTAS_PRIVADAS.some((ruta) => pathname.startsWith(ruta));

  if (esPrivada && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/entrar';
    url.searchParams.set('volver', pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
