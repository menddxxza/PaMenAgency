import { Globe, GlobeLock, Instagram, AlertTriangle, Clock3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Opportunity, WebsiteStatus } from '@/lib/types';

const WEBSITE_STATUS_CONFIG: Record<
  WebsiteStatus,
  { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'brand'; icon: typeof Globe }
> = {
  no_website: { label: 'Sin web', variant: 'danger', icon: GlobeLock },
  social_only: { label: 'Solo redes', variant: 'warning', icon: Instagram },
  broken: { label: 'Web rota', variant: 'danger', icon: AlertTriangle },
  outdated: { label: 'Web antigua', variant: 'warning', icon: Clock3 },
  active: { label: 'Web activa', variant: 'success', icon: Globe },
};

export function WebsiteStatusBadge({ status }: { status: WebsiteStatus }) {
  const { label, variant, icon: Icon } = WEBSITE_STATUS_CONFIG[status];
  return (
    <Badge variant={variant}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

const OPPORTUNITY_CONFIG: Record<Opportunity, { label: string; variant: 'success' | 'warning' | 'outline' }> = {
  alta: { label: 'Alta', variant: 'success' },
  media: { label: 'Media', variant: 'warning' },
  baja: { label: 'Baja', variant: 'outline' },
};

export function OpportunityBadge({ opportunity }: { opportunity: Opportunity }) {
  const { label, variant } = OPPORTUNITY_CONFIG[opportunity];
  return <Badge variant={variant}>{label}</Badge>;
}
