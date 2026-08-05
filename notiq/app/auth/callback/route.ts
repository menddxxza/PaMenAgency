import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Vuelta del magic link y del OAuth. Supabase manda aquí con un `code` que hay que
 * canjear por la sesión (PKCE) antes de dejar entrar al usuario.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const volver = searchParams.get('volver');

  // Solo rutas internas: un `volver` con host propio sería un redirect abierto.
  const destino = volver && volver.startsWith('/') && !volver.startsWith('//')
    ? volver
    : '/notas';

  if (!code) {
    return NextResponse.redirect(`${origin}/entrar?error=enlace`);
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.redirect(`${origin}/entrar?error=configuracion`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/entrar?error=enlace`);
  }

  return NextResponse.redirect(`${origin}${destino}`);
}
