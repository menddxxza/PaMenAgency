import { cn } from '@/lib/utils';

export function LiveBadge({ active = true, label = 'En vivo' }: { active?: boolean; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
      <span className="relative flex h-2 w-2">
        {active && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', active ? 'bg-success' : 'bg-muted')} />
      </span>
      {active ? label : 'Conectando…'}
    </span>
  );
}
