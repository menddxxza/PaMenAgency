import { Mail, Phone } from 'lucide-react';
import { requireBusinessContext } from '@/lib/server/org-context';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CsvUpload } from '@/components/leads/csv-upload';
import { RealtimeStatus } from '@/components/live/realtime-status';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Lead } from '@/lib/types';

const STATUS_VARIANT = {
  new: 'outline',
  contacted: 'brand',
  qualified: 'warning',
  converted: 'success',
  lost: 'danger',
} as const;

const STATUS_LABEL: Record<Lead['status'], string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  qualified: 'Cualificado',
  converted: 'Convertido',
  lost: 'Perdido',
};

export default async function LeadsPage() {
  const { business, organization } = await requireBusinessContext();
  const supabase = createClient();

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-brand-400">Leads</p>
          <h1 className="mt-1 text-2xl font-semibold text-fg">Contactos reales de {business.name}</h1>
          <p className="mt-1 text-sm text-muted">
            Sube tu lista real de contactos para que los agentes trabajen sobre gente de verdad, no datos de ejemplo.
          </p>
        </div>
        <RealtimeStatus organizationId={organization.id} />
      </div>

      <Card className="p-5">
        <CsvUpload />
      </Card>

      <Card className="p-0">
        {!leads || leads.length === 0 ? (
          <p className="p-5 text-sm text-muted">Todavía no has importado ningún lead. Sube un CSV arriba para empezar.</p>
        ) : (
          <ul className="divide-y divide-border">
            {leads.map((lead) => (
              <li key={lead.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <p className="text-sm font-medium text-fg">{lead.name}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted">
                    {lead.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {lead.email}
                      </span>
                    )}
                    {lead.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {lead.phone}
                      </span>
                    )}
                    <span>{formatDate(lead.created_at)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {lead.estimated_value != null && (
                    <span className="text-xs text-muted">{formatCurrency(lead.estimated_value)}</span>
                  )}
                  <Badge variant={STATUS_VARIANT[lead.status]}>{STATUS_LABEL[lead.status]}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
