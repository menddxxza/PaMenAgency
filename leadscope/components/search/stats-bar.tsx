import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import type { Business } from '@/lib/types';

export function StatsBar({ businesses }: { businesses: Business[] }) {
  const total = businesses.length;
  const noWebsite = businesses.filter((b) => b.websiteStatus === 'no_website').length;
  const socialOnly = businesses.filter((b) => b.websiteStatus === 'social_only').length;
  const highOpportunity = businesses.filter((b) => b.opportunity === 'alta').length;

  const stats = [
    { label: 'Resultados', value: total },
    { label: 'Sin página web', value: noWebsite },
    { label: 'Solo redes sociales', value: socialOnly },
    { label: 'Oportunidad alta', value: highOpportunity },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="p-4">
          <p className="text-2xl font-semibold text-fg">{formatNumber(s.value)}</p>
          <p className="mt-0.5 text-xs text-muted">{s.label}</p>
        </Card>
      ))}
    </div>
  );
}
