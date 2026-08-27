import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/onboarding', '/audit', '/opportunities', '/agents', '/dashboard', '/settings', '/leads', '/admin'];
const AUTH_PAGES = ['/login', '/signup'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // El landing, las páginas de sector, la API, etc. no dependen de la
  // sesión: no tocar Supabase Auth ahí evita que una lentitud/caída puntual
  // de Supabase tumbe páginas públicas que ni siquiera la necesitan (fue
  // exactamente lo que causó un MIDDLEWARE_INVOCATION_TIMEOUT en todo el
  // sitio, incluida la home, el 26/08/2026).
  if (!isProtected && !isAuthPage) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sin credenciales de Supabase configuradas, no se puede resolver sesión:
  // se trata como visitante anónimo en vez de tumbar cada página del sitio.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // getSession() lee la sesión de las cookies sin llamar a la red (a
  // diferencia de getUser(), que revalida el JWT contra Supabase en cada
  // petición). Aquí sólo decide si mostrar /login o dejar pasar — no es el
  // límite de seguridad real: cada Route Handler vuelve a llamar a
  // getUser() antes de tocar datos, y RLS protege la base de datos
  // independientemente de lo que diga el middleware. Usar getUser() aquí
  // hacía que una lentitud de Supabase Auth (aunque fuera de sólo unos
  // segundos) bloqueara el login de usuarios reales con sesión válida,
  // devolviéndolos a /login en bucle — reportado en producción el
  // 26/08/2026 justo después de introducir el chequeo con getUser().
  const {
    data: { session },
  } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
  const user = session?.user ?? null;

  if (isProtected && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}
