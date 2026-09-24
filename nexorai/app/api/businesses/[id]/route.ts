import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { track } from '@/lib/analytics';
import { ACTIVE_BUSINESS_COOKIE } from '@/lib/server/active-business';

const paramsSchema = z.object({ id: z.string().uuid() });

/** Elimina un negocio de la organización. Cascada en DB borra sus datos asociados. */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: 'Negocio inválido.' }, { status: 400 });
  }
  const businessId = parsedParams.data.id;

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
    .eq('id', businessId)
    .eq('organization_id', membership.organization_id)
    .maybeSingle();

  if (!business) {
    return NextResponse.json({ error: 'Ese negocio no pertenece a tu organización.' }, { status: 403 });
  }

  const { error: deleteError } = await supabase.from('businesses').delete().eq('id', businessId);

  if (deleteError) {
    console.error('[businesses] delete failed', deleteError);
    return NextResponse.json({ error: 'No se pudo eliminar el negocio.' }, { status: 500 });
  }

  await track(supabase, 'business_deleted', {
    organizationId: membership.organization_id,
    userId: user.id,
    metadata: { businessId },
  });

  const response = NextResponse.json({ ok: true });
  // Si era el negocio activo, se limpia la cookie para que la sesión recaiga
  // en el siguiente negocio disponible (o en ninguno, ver resolveActiveBusiness).
  if (cookies().get(ACTIVE_BUSINESS_COOKIE)?.value === businessId) {
    response.cookies.delete(ACTIVE_BUSINESS_COOKIE);
  }
  return response;
}
