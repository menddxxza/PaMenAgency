import { Search, ListFilter, MessageSquareText, Bell, RefreshCw, BarChart3 } from 'lucide-react';
import { AGENT_CATALOG } from '@/lib/agents/catalog';
import { Card } from '@/components/ui/card';

const ICONS = {
  lead_hunter: Search,
  lead_qualifier: ListFilter,
  sales_assistant: MessageSquareText,
  follow_up: Bell,
  reactivation: RefreshCw,
  revenue_analyst: BarChart3,
} as const;

export function AgentsPreview() {
  return (
    <section id="agentes" className="mx-auto max-w-6xl px-4 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-brand-400">Agentes IA</p>
        <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Un agente especializado por cada tipo de oportunidad
        </h2>
        <p className="mt-3 text-sm text-muted">
          Cada agente tiene un objetivo único, herramientas propias y permisos acotados. Ninguno actúa
          fuera de tu negocio sin que actives su oportunidad primero.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENT_CATALOG.map((agent) => {
          const Icon = ICONS[agent.key];
          return (
            <Card key={agent.key} className="p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10">
                <Icon className="h-4 w-4 text-brand-400" strokeWidth={1.75} />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-fg">{agent.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{agent.description}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
