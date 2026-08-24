import Link from 'next/link';
import type { Agent } from '@/lib/types';
import { getAgentDefinition } from '@/lib/agents/catalog';

const STATUS_DOT = { active: '🟢', idle: '⚪️', paused: '🟡', error: '🔴' } as const;

export function ActiveAgentsList({ agents }: { agents: Agent[] }) {
  if (agents.length === 0) {
    return (
      <p className="text-sm text-muted">
        Todavía no hay agentes activos.{' '}
        <Link href="/opportunities" className="text-brand-400 hover:underline">
          Activa una oportunidad
        </Link>{' '}
        para poner el primero a trabajar.
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {agents.map((agent) => {
        const def = getAgentDefinition(agent.key);
        return (
          <li key={agent.id} className="flex items-center justify-between text-sm">
            <span className="text-fg">
              {STATUS_DOT[agent.status]} {def.name}
            </span>
            <span className="text-xs capitalize text-muted">{agent.status}</span>
          </li>
        );
      })}
    </ul>
  );
}
