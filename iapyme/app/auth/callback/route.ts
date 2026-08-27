import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Cierra el flujo de OAuth y el de confirmación de email. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const volver = searchParams.get('volver') ?? '/';

  // Solo rutas internas: un `volver` con host propio sería un redirect abierto.
  const destino = volver.startsWith('/') && !volver.startsWith('//') ? volver : '/';

  // Si Google/Supabase rechazan el login (p.ej. la URL de redirect no está en la
  // lista blanca de Supabase), vuelven aquí con `error_description` en vez de `code`.
  const errorProveedor = searchParams.get('error_description');
  if (errorProveedor) {
    return NextResponse.redirect(`${origin}/entrar?error=${encodeURIComponent(errorProveedor)}`);
  }

  if (code) {
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${destino}`);
      return NextResponse.redirect(`${origin}/entrar?error=${encodeURIComponent(error.message)}`);
    }
  }

  return NextResponse.redirect(`${origin}/entrar?error=1`);
}
