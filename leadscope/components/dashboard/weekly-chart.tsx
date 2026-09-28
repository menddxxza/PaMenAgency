import { Card } from '@/components/ui/card';

interface WeeklyChartProps {
  createdAtDates: string[];
}

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // lunes = 0
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day);
  return date;
}

export function WeeklyChart({ createdAtDates }: WeeklyChartProps) {
  const now = startOfWeek(new Date());
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = new Date(now);
    start.setDate(start.getDate() - (7 - i) * 7);
    return start;
  });

  const counts = weeks.map((weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return createdAtDates.filter((iso) => {
      const d = new Date(iso);
      return d >= weekStart && d < weekEnd;
    }).length;
  });

  const max = Math.max(1, ...counts);

  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-fg">Búsquedas por semana</p>
      <p className="mt-0.5 text-xs text-muted">Últimas 8 semanas</p>
      <div className="mt-5 flex h-24 gap-2">
        {counts.map((count, i) => (
          <div key={i} className="flex h-full flex-1 flex-col justify-end">
            <div
              className="w-full rounded-t-md bg-brand-500/80 transition-all duration-500 ease-out"
              style={{ height: `${Math.max(4, (count / max) * 100)}%` }}
              title={`${count} búsquedas`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-2 text-[10px] text-muted">
        {weeks.map((w, i) => (
          <span key={i} className="flex-1 text-center">
            {w.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
          </span>
        ))}
      </div>
    </Card>
  );
}
