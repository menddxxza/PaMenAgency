import { DemoTag, AIDraftTag } from '@/components/ui/demo-tag';
import { TaskCheckbox } from '@/components/dashboard/task-checkbox';
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
          <TaskCheckbox taskId={task.id} done={task.status === 'done'} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-fg">{task.title}</p>
              {task.is_simulated ? <DemoTag /> : <AIDraftTag />}
            </div>
            {task.result_summary && (
              <p className="mt-1 whitespace-pre-line text-xs text-muted">{task.result_summary}</p>
            )}
            <p className="mt-1 text-xs text-muted">
              {task.agentName} · {formatDate(task.scheduled_for)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
