import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { excedeLimite, obtenerIp } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requerirSesion(request: Request) {
  if (excedeLimite(obtenerIp(request), 20, 60_000)) {
    return { error: NextResponse.json({ error: 'Demasiados intentos, prueba en un minuto.' }, { status: 429 }) };
  }

  const supabase = createClient();
  if (!supabase) {
    return {
      error: NextResponse.json(
        { error: 'La base de datos no está configurada todavía.' },
        { status: 503 },
      ),
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'Inicia sesión para guardar favoritos.' }, { status: 401 }) };
  }

  return { supabase, user };
}

/**
 * Lista de product_id en favoritos del usuario con sesión. Sin sesión (visitante
 * anónimo, o Supabase sin configurar) devuelve una lista vacía con 200, nunca
 * un error: el widget de favoritos la pide en cada carga de página.
 */
export async function GET() {
  const supabase = createClient();
  if (!supabase) return NextResponse.json({ ids: [] });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ids: [] });

  const { data } = await supabase.from('favorites').select('product_id').eq('buyer_id', user.id);
  return NextResponse.json({ ids: (data ?? []).map((f) => f.product_id) });
}

export async function POST(request: Request) {
  const sesion = await requerirSesion(request);
  if (sesion.error) return sesion.error;
  const { supabase, user } = sesion;

  let cuerpo: { productId?: unknown };
  try {
    cuerpo = (await request.json()) as { productId?: unknown };
  } catch {
    return NextResponse.json({ error: 'Petición inválida.' }, { status: 400 });
  }

  const productId = typeof cuerpo.productId === 'string' ? cuerpo.productId.trim().slice(0, 40) : '';
  if (!productId) return NextResponse.json({ error: 'Falta el producto.' }, { status: 400 });

  const { error } = await supabase.from('favorites').insert({
    buyer_id: user.id,
    product_id: productId,
  });

  // Ya estaba guardado: no es un error para quien hace clic dos veces.
  if (error && error.code !== '23505') {
    console.error('[favoritos] error al guardar:', error.message);
    return NextResponse.json({ error: 'No hemos podido guardarlo. Inténtalo de nuevo.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const sesion = await requerirSesion(request);
  if (sesion.error) return sesion.error;
  const { supabase, user } = sesion;

  const productId = new URL(request.url).searchParams.get('productId')?.slice(0, 40) ?? '';
  if (!productId) return NextResponse.json({ error: 'Falta el producto.' }, { status: 400 });

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('buyer_id', user.id)
    .eq('product_id', productId);

  if (error) {
    console.error('[favoritos] error al borrar:', error.message);
    return NextResponse.json({ error: 'No hemos podido quitarlo. Inténtalo de nuevo.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
