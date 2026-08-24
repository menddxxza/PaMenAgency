import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { requireBusinessContext } from '@/lib/server/org-context';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EstimateNote } from '@/components/ui/demo-tag';
import { formatCurrency } from '@/lib/utils';

const CATEGORY_LABEL: Record<string, string> = {
  unfollowed_leads: 'Leads sin seguimiento',
  reactivation: 'Clientes antiguos recuperables',
  prospecting: 'Prospección',
  automation: 'Automatización comercial',
  conversion_optimization: 'Optimización de conversión',
};

export default async function AuditPage() {
  const { business, organization } = await requireBusinessContext();
  const supabase = createClient();

  const { data: goal } = await supabase
    .from('goals')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*')
    .eq('business_id', business.id)
    .in('status', ['suggested', 'activated'])
    .order('priority', { ascending: false });

  const { data: auditEvents } = await supabase
    .from('audit_log')
    .select('metadata, created_at')
    .eq('organization_id', organization.id)
    .eq('event', 'audit_completed')
    .order('created_at', { ascending: false })
    .limit(1);

  const summaryMeta = auditEvents?.[0]?.metadata as
    | { summary?: string; generatedByModel?: boolean; totalPotentialMin?: number; totalPotentialMax?: number }
    | undefined;

  if (!goal || !opportunities || opportunities.length === 0) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <p className="text-sm text-muted">Todavía no has generado tu auditoría de crecimiento.</p>
        <Link href="/onboarding/goal" className="mt-4 inline-block">
          <Button>
            Definir mi objetivo
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </Card>
    );
  }

  const totalMin = opportunities.reduce((s, o) => s + o.potential_min, 0);
  const totalMax = opportunities.reduce((s, o) => s + o.potential_max, 0);
  const maxPotential = Math.max(...opportunities.map((o) => o.potential_max), 1);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-brand-400">AI Business Audit</p>
        <h1 className="mt-1 text-2xl font-semibold text-fg">Potencial de {business.name}</h1>
      </div>

      <Card className="bg-gradient-to-b from-brand-500/10 to-transparent p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Potencial detectado</p>
        <p className="mt-2 font-display text-4xl font-semibold text-fg sm:text-5xl">
          {formatCurrency(summaryMeta?.totalPotentialMin ?? totalMin)} –{' '}
          {formatCurrency(summaryMeta?.totalPotentialMax ?? totalMax)}
          <span className="ml-2 text-lg font-normal text-muted">/mes</span>
        </p>
        <EstimateNote className="mt-2" />

        {summaryMeta?.summary && (
          <div className="mt-5 rounded-xl border border-border bg-surface/60 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-brand-300">
              <Sparkles className="h-3.5 w-3.5" />
              Resumen ejecutivo
              <Badge variant={summaryMeta.generatedByModel ? 'brand' : 'outline'} className="ml-auto">
                {summaryMeta.generatedByModel ? 'Generado por modelo de IA' : 'Plantilla local (sin proveedor de IA configurado)'}
              </Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{summaryMeta.summary}</p>
          </div>
        )}
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-fg">Desglose por categoría</h2>
        <div className="space-y-3">
          {opportunities.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-fg">{CATEGORY_LABEL[o.category] ?? o.name}</p>
                <p className="font-mono text-sm text-fg">
                  {formatCurrency(o.potential_min)} – {formatCurrency(o.potential_max)}
                </p>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${Math.max(6, (o.potential_max / maxPotential) * 100)}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <CardContent className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-xs text-muted">
          Objetivo declarado:{' '}
          <span className="text-fg">{goal.raw_input || `${goal.target_value} (${goal.goal_type})`}</span> · Plazo:{' '}
          <span className="text-fg">{goal.timeframe_days} días</span>.
        </p>
      </CardContent>

      <div className="flex justify-end">
        <Link href="/opportunities">
          <Button size="lg">
            Ver oportunidades
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
