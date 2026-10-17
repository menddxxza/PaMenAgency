import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { track } from '@/lib/analytics';
import { getAgentDefinition } from '@/lib/agents/catalog';
import { planAgentWork } from '@/lib/agents/plan';
import { goalLabel } from '@/lib/ai/provider';
import { getSector } from '@/lib/sectors';
import type { OpportunityEstimate } from '@/lib/ai/audit-engine';

function addDays(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Vuelve a pedir al proveedor de IA un plan de trabajo para un agente ya
 * activado, sustituyendo sus tareas actuales. Pensado para agentes que se
 * activaron antes de que `planAgentWork` generara contenido real (o cuyo
 * plan quedó desactualizado): no crea un agente nuevo, sólo refresca su
 * `agent_tasks`.
 */
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const { data: agent } = await supabase.from('agents').select('*').eq('id', params.id).maybeSingle();

  if (!agent) {
    return NextResponse.json({ error: 'Agente no encontrado.' }, { status: 404 });
  }

  if (!agent.opportunity_id) {
    return NextResponse.json(
      { error: 'Este agente no tiene una oportunidad asociada, no hay nada que regenerar.' },
      { status: 400 }
    );
  }

  const { data: opportunity } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', agent.opportunity_id)
    .maybeSingle();

  if (!opportunity) {
    return NextResponse.json({ error: 'Oportunidad no encontrada.' }, { status: 404 });
  }

  const [{ data: business }, { data: goal }] = await Promise.all([
    supabase.from('businesses').select('*').eq('id', agent.business_id).maybeSingle(),
    supabase
      .from('goals')
      .select('*')
      .eq('business_id', agent.business_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

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

  const agentDef = getAgentDefinition(agent.key);
  const sector = business ? getSector(business.sector) : null;
  const plan = await planAgentWork(estimate, agentDef, {
    businessName: business?.name ?? 'el negocio',
    sectorName: sector?.name ?? business?.sector ?? '',
    mainProblem: business?.main_problem ?? '',
    goalLabel: goal
      ? goalLabel({ goalType: goal.goal_type, targetValue: goal.target_value, timeframeDays: goal.timeframe_days })
      : 'crecer',
  });

  await supabase.from('agent_tasks').delete().eq('agent_id', agent.id);

  const { error: insertError } = await supabase.from('agent_tasks').insert(
    plan.tasks.map((t) => ({
      organization_id: agent.organization_id,
      agent_id: agent.id,
      title: t.title,
      result_summary: t.detail,
      status: t.dayOffset === 0 ? 'done' : 'pending',
      is_simulated: !plan.generatedByModel,
      scheduled_for: addDays(t.dayOffset),
      completed_at: t.dayOffset === 0 ? new Date().toISOString() : null,
    }))
  );

  if (insertError) {
    return NextResponse.json({ error: 'No se pudo regenerar el plan del agente.' }, { status: 500 });
  }

  await track(supabase, 'agent_started', {
    organizationId: agent.organization_id,
    userId: user.id,
    metadata: { agentId: agent.id, key: agent.key, regenerated: true, generatedByModel: plan.generatedByModel },
  });

  return NextResponse.json({ ok: true });
}
