import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { track } from '@/lib/analytics';
import { parseLeadsCsv } from '@/lib/leads/csv';
import { ACTIVE_BUSINESS_COOKIE, resolveActiveBusiness } from '@/lib/server/active-business';

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Falta el archivo CSV.' }, { status: 400 });
  }

  const text = await file.text();

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: 'Primero crea tu negocio.' }, { status: 400 });
  }

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: true });

  const activeBusinessId = cookies().get(ACTIVE_BUSINESS_COOKIE)?.value;
  const business = resolveActiveBusiness(businesses ?? [], activeBusinessId);

  if (!business) {
    return NextResponse.json({ error: 'Primero crea tu negocio.' }, { status: 400 });
  }

  const { rows, errors } = parseLeadsCsv(text);

  if (rows.length === 0) {
    return NextResponse.json({ imported: 0, skipped: errors.length, errors }, { status: 400 });
  }

  const { error: insertError } = await supabase.from('leads').insert(
    rows.map((r) => ({
      organization_id: membership.organization_id,
      business_id: business.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      estimated_value: r.estimatedValue,
      source: 'csv_import',
      status: 'new' as const,
      is_simulated: false,
    }))
  );

  if (insertError) {
    return NextResponse.json({ error: 'No se pudieron guardar los leads.' }, { status: 500 });
  }

  await track(supabase, 'lead_created', {
    organizationId: membership.organization_id,
    userId: user.id,
    metadata: { count: rows.length, source: 'csv_import', isSimulated: false },
  });

  return NextResponse.json({ imported: rows.length, skipped: errors.length, errors });
}
