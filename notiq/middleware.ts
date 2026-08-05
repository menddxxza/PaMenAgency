import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigurado } from '@/lib/supabase/config';

/** Rutas que exigen sesión iniciada. */
const RUTAS_PRIVADAS = ['/notas', '/tareas', '/asistente', '/ajustes'];

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

  // getUser() y no getSession(): además de leer la cookie, refresca el token
  // caducado y valida la firma contra Supabase.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ruta = request.nextUrl.pathname;
  const esPrivada = RUTAS_PRIVADAS.some((r) => ruta === r || ruta.startsWith(`${r}/`));

  if (!user && esPrivada) {
    const destino = request.nextUrl.clone();
    destino.pathname = '/entrar';
    destino.search = `?volver=${encodeURIComponent(ruta)}`;
    return NextResponse.redirect(destino);
  }

  if (user && ruta === '/entrar') {
    const destino = request.nextUrl.clone();
    destino.pathname = '/notas';
    destino.search = '';
    return NextResponse.redirect(destino);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)'],
};
