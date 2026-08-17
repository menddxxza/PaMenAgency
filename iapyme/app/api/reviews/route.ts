import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase';
import { excedeLimite, obtenerIp } from '@/lib/security/rate-limit';
import { avisarNuevaResena } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function texto(valor: unknown, maximo: number): string {
  return typeof valor === 'string' ? valor.trim().slice(0, maximo) : '';
}

export async function POST(request: Request) {
  if (excedeLimite(obtenerIp(request), 6, 60_000)) {
    return NextResponse.json({ error: 'Demasiados intentos, prueba en un minuto.' }, { status: 429 });
  }

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'La base de datos no está configurada todavía.' },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Inicia sesión para dejar una reseña.' },
      { status: 401 },
    );
  }

  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Petición inválida.' }, { status: 400 });
  }

  const productId = texto(cuerpo.productId, 40);
  const comentario = texto(cuerpo.comentario, 1000);
  const puntuacion = Number(cuerpo.puntuacion);

  if (!productId) return NextResponse.json({ error: 'Falta el producto.' }, { status: 400 });
  if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
    return NextResponse.json({ error: 'Elige una puntuación de 1 a 5.' }, { status: 400 });
  }
  if (comentario.length < 10) {
    return NextResponse.json(
      { error: 'Cuéntanos algo más, mínimo 10 caracteres.' },
      { status: 400 },
    );
  }

  const { data: producto } = await supabase
    .from('products')
    .select('seller_id, titulo')
    .eq('id', productId)
    .maybeSingle();

  const { error } = await supabase.from('reviews').insert({
    product_id: productId,
    buyer_id: user.id,
    puntuacion,
    comentario,
  });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Ya has dejado una reseña en este producto.' },
        { status: 409 },
      );
    }
    if (error.message.includes('No puedes valorar tu propio producto')) {
      return NextResponse.json(
        { error: 'No puedes valorar tu propio producto.' },
        { status: 403 },
      );
    }
    console.error('[reviews] error al guardar:', error.message);
    return NextResponse.json(
      { error: 'No hemos podido guardar tu reseña. Inténtalo de nuevo.' },
      { status: 500 },
    );
  }

  if (producto) {
    const admin = getServiceClient();
    if (admin) {
      const { data: vendedor } = await admin.auth.admin.getUserById(producto.seller_id);
      if (vendedor.user?.email) {
        await avisarNuevaResena({
          sellerEmail: vendedor.user.email,
          tituloProducto: producto.titulo,
          puntuacion,
          comentario,
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
