import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { track } from '@/lib/analytics';

const bodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  sector: z.string().trim().min(1).max(80),
  location: z.string().trim().max(200).optional().default(''),
  website: z.string().trim().max(300).optional().default(''),
  employeesRange: z.string().trim().max(20).optional().default('1-5'),
  avgTicket: z.number().min(0).max(10_000_000),
  currentCustomers: z.number().int().min(0).max(10_000_000),
  monthlyRevenue: z.number().min(0).max(10_000_000_000),
  monthlyLeads: z.number().int().min(0).max(10_000_000),
  conversionRate: z.number().min(0).max(1),
  acquisitionChannels: z.array(z.string().trim().max(60)).max(20).default([]),
  mainProblem: z.string().trim().max(2000).optional().default(''),
});

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
    return NextResponse.json({ error: 'Datos de negocio inválidos.' }, { status: 400 });
  }
  const input = parsed.data;

  // Un negocio por organización en el MVP: si ya existe, se reutiliza la organización.
  const { data: existingMembership } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  let organizationId = existingMembership?.organization_id;

  if (!organizationId) {
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: input.name, created_by: user.id })
      .select('id')
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: 'No se pudo crear la organización.' }, { status: 500 });
    }
    organizationId = org.id;

    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({ organization_id: organizationId, user_id: user.id, role: 'owner' });

    if (membershipError) {
      return NextResponse.json({ error: 'No se pudo asociar el usuario a la organización.' }, { status: 500 });
    }
  }

  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .upsert(
      {
        organization_id: organizationId,
        name: input.name,
        sector: input.sector,
        location: input.location || null,
        website: input.website || null,
        employees_range: input.employeesRange || null,
        main_problem: input.mainProblem || null,
        acquisition_channels: input.acquisitionChannels,
      },
      { onConflict: 'organization_id' }
    )
    .select('id')
    .single();

  if (businessError || !business) {
    return NextResponse.json({ error: 'No se pudo guardar el negocio.' }, { status: 500 });
  }

  await supabase.from('business_metrics').insert({
    business_id: business.id,
    organization_id: organizationId,
    avg_ticket: input.avgTicket,
    current_customers: input.currentCustomers,
    monthly_revenue: input.monthlyRevenue,
    monthly_leads: input.monthlyLeads,
    conversion_rate: input.conversionRate,
  });

  await track(supabase, 'business_created', {
    organizationId,
    userId: user.id,
    metadata: { businessId: business.id, sector: input.sector },
  });

  return NextResponse.json({ organizationId, businessId: business.id });
}
