import { getVerifiedUser } from '@/lib/supabase/server';
import { Topbar } from '@/components/dashboard/topbar';
import { PlanCard } from '@/components/billing/plan-card';
import { PLANS, PLAN_ORDER, type PlanId } from '@/lib/types';

export default async function BillingPage() {
  const { supabase, user } = await getVerifiedUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user!.id)
    .single();

  const plan: PlanId = (profile?.plan as PlanId) ?? 'free';

  const periodStart = new Date();
  periodStart.setDate(1);
  const { data: usage } = await supabase
    .from('usage_counters')
    .select('searches_count')
    .eq('user_id', user!.id)
    .eq('period_start', periodStart.toISOString().slice(0, 10))
    .maybeSingle();

  const used = usage?.searches_count ?? 0;
  const limit = PLANS[plan].searchLimitPerMonth;

  return (
    <>
      <Topbar title="Plan y facturación" />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        {limit !== null && (
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-sm font-medium text-fg">Uso este mes</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-hover">
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{ width: `${limit ? Math.min((used / limit) * 100, 100) : 0}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              {used} de {limit} búsquedas usadas · plan {PLANS[plan].name}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PLAN_ORDER.map((id) => (
            <PlanCard key={id} plan={PLANS[id]} currentPlan={plan} />
          ))}
        </div>
      </main>
    </>
  );
}
