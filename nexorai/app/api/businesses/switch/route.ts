import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { ACTIVE_BUSINESS_COOKIE } from '@/lib/server/active-business';

const bodySchema = z.object({ businessId: z.string().uuid() });

/** Cambia el negocio activo de la sesión — sólo entre negocios de la propia organización. */
export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Negocio inválido.' }, { status: 400 });
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: 'No tienes una organización.' }, { status: 400 });
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', parsed.data.businessId)
    .eq('organization_id', membership.organization_id)
    .maybeSingle();

  if (!business) {
    return NextResponse.json({ error: 'Ese negocio no pertenece a tu organización.' }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACTIVE_BUSINESS_COOKIE, business.id, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
