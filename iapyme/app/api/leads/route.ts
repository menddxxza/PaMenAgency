import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase';
import { excedeLimite, obtenerIp } from '@/lib/security/rate-limit';
import { avisarNuevoLead } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function texto(valor: unknown, maximo: number): string {
  return typeof valor === 'string' ? valor.trim().slice(0, maximo) : '';
}

export async function POST(request: Request) {
  if (excedeLimite(obtenerIp(request), 8, 60_000)) {
    return NextResponse.json({ error: 'Demasiados intentos, prueba en un minuto.' }, { status: 429 });
  }

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'La base de datos no está configurada todavía.' },
      { status: 503 },
    );
  }

  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Petición inválida.' }, { status: 400 });
  }

  // Campo trampa: invisible para personas, los bots que rellenan todo lo detectan.
  if (texto(cuerpo.web, 200).length > 0) {
    return NextResponse.json({ ok: true });
  }

  const productId = texto(cuerpo.productId, 40);
  const nombre = texto(cuerpo.nombre, 120);
  const email = texto(cuerpo.email, 254).toLowerCase();
  const mensaje = texto(cuerpo.mensaje, 2000);
  const empresa = texto(cuerpo.empresa, 160) || null;
  const telefono = texto(cuerpo.telefono, 40) || null;

  if (!productId) return NextResponse.json({ error: 'Falta el producto.' }, { status: 400 });
  if (!nombre) return NextResponse.json({ error: 'Escribe tu nombre.' }, { status: 400 });
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Escribe un email válido.' }, { status: 400 });
  }
  if (mensaje.length < 5) {
    return NextResponse.json({ error: 'Cuéntale algo más al vendedor.' }, { status: 400 });
  }

  // El seller_id se toma del producto, nunca de lo que manda el cliente: si no,
  // cualquiera podría inyectar leads en la bandeja de otro vendedor.
  const { data: producto } = await supabase
    .from('products')
    .select('id, seller_id, status, titulo')
    .eq('id', productId)
    .maybeSingle();

  if (!producto || producto.status !== 'published') {
    return NextResponse.json({ error: 'Esa solución ya no está disponible.' }, { status: 404 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('leads').insert({
    product_id: producto.id,
    seller_id: producto.seller_id,
    buyer_id: user?.id ?? null,
    nombre,
    email,
    telefono,
    empresa,
    mensaje,
  });

  if (error) {
    console.error('[leads] error al guardar:', error.message);
    return NextResponse.json(
      { error: 'No hemos podido enviarlo. Inténtalo de nuevo.' },
      { status: 500 },
    );
  }

  const admin = getServiceClient();
  if (admin) {
    const { data: vendedor } = await admin.auth.admin.getUserById(producto.seller_id);
    if (vendedor.user?.email) {
      await avisarNuevoLead({
        sellerEmail: vendedor.user.email,
        tituloProducto: producto.titulo,
        nombreComprador: nombre,
        mensaje,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
