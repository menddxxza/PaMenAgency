import { Coins, Target, Users, PhoneCall, Handshake, Percent } from 'lucide-react';
import { requireBusinessContext } from '@/lib/server/org-context';
import { createClient } from '@/lib/supabase/server';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { RevenueChart, type RevenuePoint } from '@/components/dashboard/revenue-chart';
import { RevenueTimeline } from '@/components/dashboard/timeline';
import { ActiveAgentsList } from '@/components/dashboard/active-agents';
import { ActionCenter } from '@/components/dashboard/action-center';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RealtimeStatus } from '@/components/live/realtime-status';
import { getAgentDefinition } from '@/lib/agents/catalog';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  const { business, organization } = await requireBusinessContext();
  const supabase = createClient();

  const [{ data: opportunities }, { data: agents }, { data: leads }, { data: revenueEvents }] = await Promise.all([
    supabase.from('opportunities').select('*').eq('business_id', business.id).in('status', ['suggested', 'activated']),
    supabase.from('agents').select('*').eq('business_id', business.id),
    supabase.from('leads').select('*').eq('business_id', business.id),
    supabase.from('revenue_events').select('*').eq('business_id', business.id).order('occurred_at', { ascending: true }),
  ]);

  const activeAgents = (agents ?? []).filter((a) => a.status === 'active');

  const agentIds = (agents ?? []).map((a) => a.id);
  const { data: tasks } = agentIds.length
    ? await supabase
        .from('agent_tasks')
        .select('*')
        .in('agent_id', agentIds)
        .order('scheduled_for', { ascending: true })
        .limit(12)
    : { data: [] };

  const agentNameById = new Map((agents ?? []).map((a) => [a.id, getAgentDefinition(a.key).name]));
  const timelineTasks = (tasks ?? []).map((t) => ({ ...t, agentName: agentNameById.get(t.agent_id) ?? 'Agente' }));

  const revenuePotentialMin = (opportunities ?? []).reduce((s, o) => s + o.potential_min, 0);
  const revenuePotentialMax = (opportunities ?? []).reduce((s, o) => s + o.potential_max, 0);
  const revenueGenerated = (revenueEvents ?? [])
    .filter((r) => r.kind === 'confirmed')
    .reduce((s, r) => s + r.amount, 0);
  const totalCost = (opportunities ?? [])
    .filter((o) => o.status === 'activated')
    .reduce((s, o) => s + o.estimated_cost, 0);

  const leadsFound = leads?.length ?? 0;
  const leadsContacted = (leads ?? []).filter((l) => l.status !== 'new').length;
  const conversions = (leads ?? []).filter((l) => l.status === 'converted').length;
  const roi = revenueGenerated > 0 && totalCost > 0 ? `${(revenueGenerated / totalCost).toFixed(1)}x` : '—';

  const potentialEvents = (revenueEvents ?? []).filter((r) => r.kind === 'potential');
  const byDate = new Map<string, number>();
  for (const event of potentialEvents) {
    const key = new Date(event.occurred_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    byDate.set(key, (byDate.get(key) ?? 0) + event.amount);
  }
  let cumulative = 0;
  const chartData: RevenuePoint[] = Array.from(byDate.entries()).map(([date, amount]) => {
    cumulative += amount;
    return { date, cumulative };
  });

  const suggestedOpportunities = (opportunities ?? [])
    .filter((o) => o.status === 'suggested')
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-brand-400">Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold text-fg">Resultados de {business.name}</h1>
        </div>
        <RealtimeStatus organizationId={organization.id} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Revenue generated" value={formatCurrency(revenueGenerated)} icon={Coins} />
        <KpiCard
          label="Revenue potential"
          value={formatCurrency(revenuePotentialMax)}
          icon={Target}
          accent="gold"
          note={`desde ${formatCurrency(revenuePotentialMin)}`}
        />
        <KpiCard
          label="Leads found"
          value={String(leadsFound)}
          icon={Users}
          note={leadsFound === 0 ? 'Sube tus contactos en /leads' : undefined}
        />
        <KpiCard label="Leads contacted" value={String(leadsContacted)} icon={PhoneCall} />
        <KpiCard label="Conversions" value={String(conversions)} icon={Handshake} />
        <KpiCard label="ROI" value={roi} icon={Percent} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolución del potencial activado</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agentes activos</CardTitle>
          </CardHeader>
          <CardContent>
            <ActiveAgentsList agents={activeAgents} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueTimeline tasks={timelineTasks} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Action Center</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionCenter opportunities={suggestedOpportunities} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
