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

/** Cuánto esperamos como máximo a que Supabase confirme la sesión antes de seguir. */
const TIMEOUT_AUTH_MS = 8000;

export async function middleware(request: NextRequest) {
  const bloqueado = candadoDeSitio(request);
  if (bloqueado) return bloqueado;

  const { pathname } = request.nextUrl;
  const esPrivada = RUTAS_PRIVADAS.some((ruta) => pathname.startsWith(ruta));

  // Solo consultamos sesión en rutas privadas: la portada, el catálogo, etc. son
  // públicas y no necesitan saber si hay usuario. Antes se llamaba a Supabase Auth
  // en cada petición (incluida la portada); un pico de lentitud de Supabase colgaba
  // esa llamada y tumbaba el sitio entero. Ver también el timeout de abajo.
  if (!esPrivada || !supabaseConfigurado()) return NextResponse.next();

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

  // getSession() no hace ninguna llamada de red aquí (createServerClient desactiva
  // autoRefreshToken), solo decodifica el token que ya viene en la cookie.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let user: { id: string } | null = null;
  let supabaseLento = false;

  if (session?.access_token) {
    // OJO: aquí NO usamos supabase.auth.getUser(). Se comprobó en producción que esa
    // llamada se queda colgada sin más dentro del Edge Middleware de Vercel — pegándole
    // directamente al mismo endpoint de Supabase desde fuera responde en <300ms, así que
    // el problema no es que Supabase vaya lento, es algo del propio SDK en este entorno.
    // Hacemos la misma verificación a mano con fetch + AbortController, que sí cancela
    // la petición de verdad si no contesta a tiempo (Promise.race solo deja de esperar,
    // no cancela la llamada colgada por debajo).
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_AUTH_MS);
    try {
      const respuesta = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
        signal: controlador.signal,
      });
      if (respuesta.ok) user = await respuesta.json();
    } catch {
      supabaseLento = true;
    } finally {
      clearTimeout(temporizador);
    }
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/entrar';
    url.searchParams.set('volver', pathname);
    // Distinguimos "no has iniciado sesión" (normal, sin aviso) de "Supabase no
    // respondió a tiempo" (avisamos, si no el usuario ve un login que parece no
    // hacer nada aunque su contraseña era correcta).
    if (supabaseLento) url.searchParams.set('aviso', 'supabase_lento');
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
