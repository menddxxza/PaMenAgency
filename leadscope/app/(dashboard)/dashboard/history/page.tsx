import Link from 'next/link';
import { ArrowRight, Search as SearchIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Topbar } from '@/components/dashboard/topbar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatNumber } from '@/lib/utils';

export default async function HistoryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: searches } = await supabase
    .from('searches')
    .select('id, niche, city, country, postal_code, results_count, no_website_count, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <>
      <Topbar title="Historial de búsquedas" />

      <main className="flex-1 space-y-3 p-4 sm:p-6">
        {!searches || searches.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-20 text-center">
            <SearchIcon className="h-8 w-8 text-muted" />
            <p className="mt-3 text-sm text-muted">Todavía no has realizado ninguna búsqueda.</p>
            <Link href="/dashboard/search" className="mt-3 text-sm font-medium text-brand-600 hover:underline">
              Hacer mi primera búsqueda
            </Link>
          </div>
        ) : (
          searches.map((s) => (
            <Link key={s.id} href={`/dashboard/history/${s.id}`}>
              <Card className="flex items-center justify-between p-4 transition-colors hover:bg-surface-hover">
                <div>
                  <p className="text-sm font-medium capitalize text-fg">{s.niche}</p>
                  <p className="text-xs text-muted">
                    {[s.city, s.postal_code, s.country].filter(Boolean).join(', ') || 'Sin ubicación'} ·{' '}
                    {formatDate(s.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="default">{formatNumber(s.results_count)} resultados</Badge>
                  <Badge variant="danger">{formatNumber(s.no_website_count)} sin web</Badge>
                  <ArrowRight className="h-4 w-4 text-muted" />
                </div>
              </Card>
            </Link>
          ))
        )}
      </main>
    </>
  );
}
