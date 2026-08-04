import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigurado } from '@/lib/supabase/config';

/** Rutas que exigen sesión iniciada. */
const RUTAS_PRIVADAS = ['/dashboard', '/admin', '/mis-leads'];

export async function middleware(request: NextRequest) {
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
