import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { requireBusinessContext } from '@/lib/server/org-context';
import { createClient } from '@/lib/supabase/server';
import { OpportunityCard } from '@/components/opportunities/opportunity-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function OpportunitiesPage() {
  const { business } = await requireBusinessContext();
  const supabase = createClient();

  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*')
    .eq('business_id', business.id)
    .in('status', ['suggested', 'activated'])
    .order('priority', { ascending: false });

  if (!opportunities || opportunities.length === 0) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <p className="text-sm text-muted">Todavía no hay oportunidades generadas para tu negocio.</p>
        <Link href="/onboarding/goal" className="mt-4 inline-block">
          <Button>
            Generar mi AI Business Audit
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-brand-400">Opportunity Engine</p>
        <h1 className="mt-1 text-2xl font-semibold text-fg">Oportunidades para {business.name}</h1>
        <p className="mt-1 text-sm text-muted">
          Activa la oportunidad y su agente empieza a trabajarla. Puedes activar varias a la vez.
        </p>
      </div>

      <div className="space-y-4">
        {opportunities.map((o) => (
          <OpportunityCard key={o.id} opportunity={o} />
        ))}
      </div>
    </div>
  );
}
