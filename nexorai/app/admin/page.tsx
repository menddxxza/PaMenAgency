import { redirect } from 'next/navigation';
import { Building2, Bot, Users2, Coins, UserPlus } from 'lucide-react';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { isPlatformAdmin } from '@/lib/access';
import { PollRefresh } from '@/components/live/poll-refresh';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const EVENT_LABEL: Record<string, string> = {
  signup: 'se registró',
  business_created: 'creó su negocio',
  business_deleted: 'borró un negocio',
  audit_started: 'empezó una auditoría',
  audit_completed: 'terminó la auditoría',
  opportunity_viewed: 'vio una oportunidad',
  opportunity_activated: 'activó una oportunidad',
  agent_created: 'creó un agente',
  agent_started: 'puso a trabajar un agente',
  lead_created: 'añadió leads',
  lead_contacted: 'contactó un lead',
  conversion_created: 'consiguió una conversión',
  revenue_recorded: 'registró ingreso',
  subscription_started: 'contrató un plan',
};

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  if (!isPlatformAdmin(user.email)) redirect('/dashboard');

  const admin = createServiceRoleClient();

  const [
    { data: organizations },
    { data: businesses },
    { data: agents },
    { data: leads },
    { data: revenueEvents },
    { data: profiles },
    { data: auditLog },
  ] = await Promise.all([
    admin.from('organizations').select('*').order('created_at', { ascending: false }),
    admin.from('businesses').select('id, organization_id, name, sector, created_at'),
    admin.from('agents').select('id, organization_id, status'),
    admin.from('leads').select('id, organization_id, is_simulated'),
    admin.from('revenue_events').select('organization_id, amount, kind'),
    admin.from('profiles').select('id, email, full_name'),
    admin
      .from('audit_log')
      .select('id, organization_id, user_id, event, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const orgById = new Map((organizations ?? []).map((o) => [o.id, o]));

  const businessesByOrg = new Map<string, { name: string; sector: string }[]>();
  for (const b of businesses ?? []) {
    const list = businessesByOrg.get(b.organization_id) ?? [];
    list.push({ name: b.name, sector: b.sector });
    businessesByOrg.set(b.organization_id, list);
  }

  const activeAgentsByOrg = new Map<string, number>();
  for (const a of agents ?? []) {
    if (a.status !== 'active') continue;
    activeAgentsByOrg.set(a.organization_id, (activeAgentsByOrg.get(a.organization_id) ?? 0) + 1);
  }

  const realLeadsByOrg = new Map<string, number>();
  for (const l of leads ?? []) {
    if (l.is_simulated) continue;
    realLeadsByOrg.set(l.organization_id, (realLeadsByOrg.get(l.organization_id) ?? 0) + 1);
  }

  const confirmedRevenueByOrg = new Map<string, number>();
  for (const r of revenueEvents ?? []) {
    if (r.kind !== 'confirmed') continue;
    confirmedRevenueByOrg.set(r.organization_id, (confirmedRevenueByOrg.get(r.organization_id) ?? 0) + r.amount);
  }

  const totalOrgs = organizations?.length ?? 0;
  const totalActiveAgents = (agents ?? []).filter((a) => a.status === 'active').length;
  const totalRealLeads = (leads ?? []).filter((l) => !l.is_simulated).length;
  const totalConfirmedRevenue = (revenueEvents ?? [])
    .filter((r) => r.kind === 'confirmed')
    .reduce((s, r) => s + r.amount, 0);

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const signupsLast24h = (organizations ?? []).filter((o) => new Date(o.created_at).getTime() > oneDayAgo).length;

  return (
    <div className="min-h-screen bg-bg p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-brand-400">Panel de admin</p>
            <h1 className="mt-1 text-2xl font-semibold text-fg">Revynai · todas las organizaciones</h1>
          </div>
          <PollRefresh intervalMs={8000} />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Organizaciones" value={String(totalOrgs)} icon={Building2} note={`+${signupsLast24h} en 24h`} />
          <KpiCard label="Agentes activos" value={String(totalActiveAgents)} icon={Bot} />
          <KpiCard label="Leads reales" value={String(totalRealLeads)} icon={Users2} />
          <KpiCard label="Ingreso confirmado" value={formatCurrency(totalConfirmedRevenue)} icon={Coins} accent="gold" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Organizaciones</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {totalOrgs === 0 ? (
                <p className="p-5 text-sm text-muted">Todavía no se ha registrado ninguna organización.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {(organizations ?? []).map((org) => {
                    const bizList = businessesByOrg.get(org.id) ?? [];
                    const owner = profileById.get(org.created_by);
                    return (
                      <li key={org.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                        <div>
                          <p className="text-sm font-medium text-fg">
                            {org.name}
                            {bizList[0] && <span className="text-muted"> · {bizList[0].sector}</span>}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            {owner?.email ?? 'sin propietario'} · {formatDate(org.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted">
                          <span>{activeAgentsByOrg.get(org.id) ?? 0} agentes</span>
                          <span>{realLeadsByOrg.get(org.id) ?? 0} leads</span>
                          <Badge variant="outline" className="capitalize">
                            {org.plan}
                          </Badge>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-3.5 w-3.5" /> Actividad en vivo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!auditLog || auditLog.length === 0 ? (
                <p className="p-5 text-sm text-muted">Sin actividad todavía.</p>
              ) : (
                <ul className="max-h-[560px] divide-y divide-border overflow-y-auto">
                  {auditLog.map((entry) => {
                    const who = entry.user_id ? profileById.get(entry.user_id)?.email : null;
                    const orgName = entry.organization_id ? orgById.get(entry.organization_id)?.name : null;
                    return (
                      <li key={entry.id} className="p-3 text-xs">
                        <p className="text-fg">
                          <span className="font-medium">{who ?? orgName ?? 'alguien'}</span>{' '}
                          {EVENT_LABEL[entry.event] ?? entry.event}
                        </p>
                        <p className="mt-0.5 text-muted">{formatRelativeTime(entry.created_at)}</p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
