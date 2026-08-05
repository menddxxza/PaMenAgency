import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { excedeLimite, obtenerIp } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PERFILES = ['comprador', 'vendedor', 'ambos'] as const;
type Perfil = (typeof PERFILES)[number];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Payload = {
  email?: unknown;
  perfil?: unknown;
  mensaje?: unknown;
  origen?: unknown;
  // Campo trampa: invisible para personas, los bots que rellenan todo lo detectan.
  web?: unknown;
};

export async function POST(request: Request) {
  if (excedeLimite(obtenerIp(request), 5, 60_000)) {
    return NextResponse.json({ error: 'Demasiados intentos, prueba en un minuto.' }, { status: 429 });
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: 'Petición inválida.' }, { status: 400 });
  }

  if (typeof body.web === 'string' && body.web.length > 0) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const perfil = body.perfil as Perfil;
  const mensaje = typeof body.mensaje === 'string' ? body.mensaje.trim().slice(0, 1000) : null;
  const origen = typeof body.origen === 'string' ? body.origen.slice(0, 120) : null;

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Escribe un email válido.' }, { status: 400 });
  }

  if (!PERFILES.includes(perfil)) {
    return NextResponse.json({ error: 'Elige si quieres comprar o vender.' }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Sin Supabase configurado la landing sigue siendo desplegable: se registra
  // el apunte en los logs y el usuario recibe confirmación igualmente.
  if (!supabase) {
    console.info('[waitlist] sin Supabase configurado:', { email, perfil, origen });
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase
    .from('waitlist')
    .upsert({ email, perfil, mensaje, origen }, { onConflict: 'email' });

  if (error) {
    console.error('[waitlist] error al guardar:', error.message);
    return NextResponse.json(
      { error: 'No hemos podido guardarlo. Inténtalo de nuevo en un momento.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, persisted: true });
}
