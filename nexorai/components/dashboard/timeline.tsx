import { CheckCircle2, Circle } from 'lucide-react';
import { DemoTag } from '@/components/ui/demo-tag';
import { formatDate } from '@/lib/utils';
import type { AgentTask } from '@/lib/types';

export function RevenueTimeline({ tasks }: { tasks: (AgentTask & { agentName: string })[] }) {
  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted">
        En cuanto actives tu primera oportunidad, aquí verás día a día lo que hacen tus agentes.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {tasks.map((task) => (
        <li key={task.id} className="flex gap-3">
          <div className="mt-0.5">
            {task.status === 'done' ? (
              <CheckCircle2 className="h-4 w-4 text-brand-400" />
            ) : (
              <Circle className="h-4 w-4 text-muted" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-fg">{task.title}</p>
              {task.is_simulated && <DemoTag />}
            </div>
            <p className="text-xs text-muted">
              {task.agentName} · {formatDate(task.scheduled_for)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
