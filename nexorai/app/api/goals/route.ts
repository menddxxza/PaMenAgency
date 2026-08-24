import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { track } from '@/lib/analytics';
import { runAuditEngine } from '@/lib/ai/audit-engine';
import { prioritizeOpportunities } from '@/lib/ai/opportunity-engine';
import { getAIProvider } from '@/lib/ai/provider';
import { getSector } from '@/lib/sectors';
import type { BusinessInput, GoalInput } from '@/lib/types';

const bodySchema = z.object({
  goalType: z.enum(['new_customers', 'revenue', 'leads', 'reactivation']),
  targetValue: z.number().min(1).max(1_000_000_000),
  timeframeDays: z.number().int().min(1).max(3650),
  rawInput: z.string().trim().max(500).optional().default(''),
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
    return NextResponse.json({ error: 'Datos de objetivo inválidos.' }, { status: 400 });
  }
  const input = parsed.data;

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: 'Primero crea tu negocio.' }, { status: 400 });
  }
  const organizationId = membership.organization_id;

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (!business) {
    return NextResponse.json({ error: 'Primero crea tu negocio.' }, { status: 400 });
  }

  const { data: metrics } = await supabase
    .from('business_metrics')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .insert({
      organization_id: organizationId,
      business_id: business.id,
      goal_type: input.goalType,
      target_value: input.targetValue,
      timeframe_days: input.timeframeDays,
      raw_input: input.rawInput || null,
    })
    .select('*')
    .single();

  if (goalError || !goal) {
    return NextResponse.json({ error: 'No se pudo guardar el objetivo.' }, { status: 500 });
  }

  await track(supabase, 'audit_started', { organizationId, userId: user.id, metadata: { goalId: goal.id } });

  const businessInput: BusinessInput = {
    name: business.name,
    sector: business.sector,
    location: business.location ?? '',
    website: business.website ?? '',
    employeesRange: business.employees_range ?? '',
    avgTicket: metrics?.avg_ticket ?? 0,
    currentCustomers: metrics?.current_customers ?? 0,
    monthlyRevenue: metrics?.monthly_revenue ?? 0,
    monthlyLeads: metrics?.monthly_leads ?? 0,
    conversionRate: metrics?.conversion_rate ?? 0,
    acquisitionChannels: business.acquisition_channels ?? [],
    mainProblem: business.main_problem ?? '',
  };
  const goalInput: GoalInput = {
    goalType: goal.goal_type,
    targetValue: goal.target_value,
    timeframeDays: goal.timeframe_days,
    rawInput: goal.raw_input ?? '',
  };

  const audit = runAuditEngine(businessInput, goalInput);
  const prioritized = prioritizeOpportunities(audit.opportunities);

  // Cualquier auditoría anterior para este negocio deja de ser la sugerencia activa.
  await supabase
    .from('opportunities')
    .update({ status: 'dismissed' })
    .eq('business_id', business.id)
    .eq('status', 'suggested');

  const { error: insertError } = await supabase.from('opportunities').insert(
    prioritized.map((o) => ({
      organization_id: organizationId,
      business_id: business.id,
      goal_id: goal.id,
      category: o.category,
      name: o.name,
      description: o.description,
      assumption: o.assumption,
      potential_min: o.potentialMin,
      potential_max: o.potentialMax,
      difficulty: o.difficulty,
      estimated_days: o.estimatedDays,
      probability: o.probability,
      estimated_cost: o.estimatedCost,
      roi_multiple: o.roiMultiple,
      priority: o.priority,
    }))
  );

  if (insertError) {
    return NextResponse.json({ error: 'No se pudieron generar las oportunidades.' }, { status: 500 });
  }

  const sector = getSector(business.sector);
  const summary = await getAIProvider().summarizeAudit({
    businessName: business.name,
    sectorName: sector?.name ?? business.sector,
    goal: { goalType: goal.goal_type, targetValue: goal.target_value, timeframeDays: goal.timeframe_days },
    totalPotentialMin: audit.totalPotentialMin,
    totalPotentialMax: audit.totalPotentialMax,
    topOpportunityNames: prioritized.slice(0, 3).map((o) => o.name),
  });

  await track(supabase, 'audit_completed', {
    organizationId,
    userId: user.id,
    metadata: {
      goalId: goal.id,
      totalPotentialMin: audit.totalPotentialMin,
      totalPotentialMax: audit.totalPotentialMax,
      summary: summary.text,
      generatedByModel: summary.generatedByModel,
      provider: summary.provider,
    },
  });

  return NextResponse.json({ goalId: goal.id });
}
