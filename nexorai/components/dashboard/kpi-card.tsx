import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  note,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: 'brand' | 'gold';
  note?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <Icon
          className={cn('h-4 w-4', accent === 'gold' ? 'text-gold-400' : 'text-brand-400')}
          strokeWidth={1.75}
        />
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-fg">{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </Card>
  );
}
