import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/onboarding', '/audit', '/opportunities', '/agents', '/dashboard', '/settings'];
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

  // Nunca dejar que una llamada lenta a Supabase Auth cuelgue el middleware
  // hasta el timeout duro de Vercel: pasados 5s se trata como visitante
  // anónimo (peor caso: redirige a /login de más, no un 504 para todos).
  const user = await Promise.race([
    supabase.auth
      .getUser()
      .then(({ data }) => data.user)
      .catch(() => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
  ]);

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
