import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { track } from '@/lib/analytics';
import { agentForCategory } from '@/lib/agents/catalog';
import { planAgentWork, distributePotentialRevenue } from '@/lib/agents/plan';
import { goalLabel } from '@/lib/ai/provider';
import { getSector } from '@/lib/sectors';
import type { OpportunityEstimate } from '@/lib/ai/audit-engine';

function addDays(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const { data: opportunity } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!opportunity) {
    return NextResponse.json({ error: 'Oportunidad no encontrada.' }, { status: 404 });
  }

  if (opportunity.status === 'activated') {
    return NextResponse.json({ ok: true, alreadyActive: true });
  }

  const agentDef = agentForCategory(opportunity.category);

  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .upsert(
      {
        organization_id: opportunity.organization_id,
        business_id: opportunity.business_id,
        opportunity_id: opportunity.id,
        key: agentDef.key,
        name: agentDef.name,
        status: 'active',
        activated_at: new Date().toISOString(),
      },
      { onConflict: 'business_id,key' }
    )
    .select('*')
    .single();

  if (agentError || !agent) {
    return NextResponse.json({ error: 'No se pudo activar el agente.' }, { status: 500 });
  }

  // Revenue Analyst es transversal: en cuanto hay actividad, se activa también.
  await supabase.from('agents').upsert(
    {
      organization_id: opportunity.organization_id,
      business_id: opportunity.business_id,
      key: 'revenue_analyst',
      name: 'Revenue Analyst',
      status: 'active',
      activated_at: new Date().toISOString(),
    },
    { onConflict: 'business_id,key' }
  );

  const estimate: OpportunityEstimate = {
    category: opportunity.category,
    name: opportunity.name,
    description: opportunity.description,
    potentialMin: opportunity.potential_min,
    potentialMax: opportunity.potential_max,
    difficulty: opportunity.difficulty,
    estimatedDays: opportunity.estimated_days,
    probability: opportunity.probability,
    estimatedCost: opportunity.estimated_cost,
    roiMultiple: opportunity.roi_multiple,
    assumption: opportunity.assumption,
  };

  const [{ data: business }, { data: goal }] = await Promise.all([
    supabase.from('businesses').select('*').eq('id', opportunity.business_id).maybeSingle(),
    supabase
      .from('goals')
      .select('*')
      .eq('business_id', opportunity.business_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const sector = business ? getSector(business.sector) : null;
  const plan = await planAgentWork(estimate, agentDef, {
    businessName: business?.name ?? 'el negocio',
    sectorName: sector?.name ?? business?.sector ?? '',
    mainProblem: business?.main_problem ?? '',
    goalLabel: goal
      ? goalLabel({ goalType: goal.goal_type, targetValue: goal.target_value, timeframeDays: goal.timeframe_days })
      : 'crecer',
  });

  await supabase.from('agent_tasks').insert(
    plan.tasks.map((t) => ({
      organization_id: opportunity.organization_id,
      agent_id: agent.id,
      title: t.title,
      result_summary: t.detail,
      status: t.dayOffset === 0 ? 'done' : 'pending',
      is_simulated: !plan.generatedByModel,
      scheduled_for: addDays(t.dayOffset),
      completed_at: t.dayOffset === 0 ? new Date().toISOString() : null,
    }))
  );

  await supabase.from('revenue_events').insert(
    distributePotentialRevenue(estimate).map((r) => ({
      organization_id: opportunity.organization_id,
      business_id: opportunity.business_id,
      opportunity_id: opportunity.id,
      agent_id: agent.id,
      kind: 'potential' as const,
      amount: r.amount,
      is_simulated: true,
      occurred_at: addDays(r.dayOffset),
    }))
  );

  await supabase
    .from('opportunities')
    .update({ status: 'activated', activated_at: new Date().toISOString() })
    .eq('id', opportunity.id);

  await track(supabase, 'opportunity_activated', {
    organizationId: opportunity.organization_id,
    userId: user.id,
    metadata: { opportunityId: opportunity.id, category: opportunity.category },
  });
  await track(supabase, 'agent_started', {
    organizationId: opportunity.organization_id,
    userId: user.id,
    metadata: { agentId: agent.id, key: agent.key, generatedByModel: plan.generatedByModel, provider: plan.provider },
  });

  return NextResponse.json({ ok: true, agentId: agent.id });
}
