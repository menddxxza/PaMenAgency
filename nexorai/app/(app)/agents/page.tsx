import { Search, ListFilter, MessageSquareText, Bell, RefreshCw, BarChart3 } from 'lucide-react';
import { requireBusinessContext } from '@/lib/server/org-context';
import { createClient } from '@/lib/supabase/server';
import { AGENT_CATALOG } from '@/lib/agents/catalog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DemoTag, AIDraftTag } from '@/components/ui/demo-tag';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Agent, AgentTask } from '@/lib/types';

const ICONS = {
  lead_hunter: Search,
  lead_qualifier: ListFilter,
  sales_assistant: MessageSquareText,
  follow_up: Bell,
  reactivation: RefreshCw,
  revenue_analyst: BarChart3,
} as const;

const STATUS_DOT = { active: '🟢', idle: '⚪️', paused: '🟡', error: '🔴' } as const;

export default async function AgentsPage() {
  const { business } = await requireBusinessContext();
  const supabase = createClient();

  const { data: agentRows } = await supabase.from('agents').select('*').eq('business_id', business.id);
  const agentByKey = new Map<string, Agent>((agentRows ?? []).map((a) => [a.key, a]));

  const agentIds = (agentRows ?? []).map((a) => a.id);
  let tasksByAgent = new Map<string, AgentTask[]>();
  if (agentIds.length > 0) {
    const { data: tasks } = await supabase
      .from('agent_tasks')
      .select('*')
      .in('agent_id', agentIds)
      .order('scheduled_for', { ascending: true });
    tasksByAgent = new Map();
    for (const t of tasks ?? []) {
      const list = tasksByAgent.get(t.agent_id) ?? [];
      list.push(t);
      tasksByAgent.set(t.agent_id, list);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-brand-400">Agentes</p>
        <h1 className="mt-1 text-2xl font-semibold text-fg">Tu equipo de agentes de Revynai</h1>
        <p className="mt-1 text-sm text-muted">
          Se activan automáticamente al activar una oportunidad en <span className="text-fg">/opportunities</span>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {AGENT_CATALOG.map((def) => {
          const Icon = ICONS[def.key];
          const row = agentByKey.get(def.key);
          const status = row?.status ?? 'idle';
          const tasks = row ? tasksByAgent.get(row.id) ?? [] : [];

          return (
            <Card key={def.key} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10">
                    <Icon className="h-4 w-4 text-brand-400" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-fg">
                      {STATUS_DOT[status]} {def.name}
                    </p>
                    <p className="text-xs text-muted">{def.objective}</p>
                  </div>
                </div>
                <Badge variant={status === 'active' ? 'success' : 'outline'} className="capitalize">
                  {status}
                </Badge>
              </div>

              <p className="mt-3 text-sm text-muted">{def.description}</p>

              {tasks.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-border pt-3">
                  <p className="text-xs font-medium text-muted">Tareas recientes</p>
                  <ul className="space-y-2">
                    {tasks.slice(0, 3).map((t) => (
                      <li key={t.id} className="text-xs text-muted">
                        <div className="flex items-center justify-between gap-2">
                          <span className={t.status === 'done' ? 'text-fg' : ''}>{t.title}</span>
                          <span className="shrink-0">{formatDate(t.scheduled_for)}</span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          {t.is_simulated ? <DemoTag /> : <AIDraftTag />}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {row && (
                <p className="mt-3 text-xs text-muted">
                  Coste acumulado: <span className="text-fg">{formatCurrency(row.cost_to_date)}</span>
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
