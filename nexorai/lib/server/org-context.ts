import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isComplimentaryAccess } from '@/lib/access';
import { getBusinessLimit } from '@/lib/plans';
import { ACTIVE_BUSINESS_COOKIE, resolveActiveBusiness } from '@/lib/server/active-business';
import type { Business, Organization } from '@/lib/types';

export interface OrgContext {
  userId: string;
  userEmail: string;
  organization: Organization;
  /** Negocio activo en esta sesión (ver ACTIVE_BUSINESS_COOKIE). */
  business: Business | null;
  /** Todos los negocios de la organización, más recientes al final. */
  businesses: Business[];
  /** Nº máximo de negocios que permite el plan actual (Infinity = ilimitado). */
  businessLimit: number;
  isComplimentary: boolean;
}

/**
 * Resuelve la organización/negocio del usuario autenticado para Server
 * Components dentro de `app/(app)/*`. Si no hay sesión, redirige a login;
 * si hay sesión pero no ha creado su negocio, redirige al onboarding.
 */
export async function requireOrgContext(): Promise<OrgContext> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect('/onboarding/business');
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', membership.organization_id)
    .single();

  if (!organization) {
    redirect('/onboarding/business');
  }

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('organization_id', membership.organization_id)
    .order('created_at', { ascending: true });

  const complimentary = isComplimentaryAccess(user.email);
  const effectivePlan = complimentary ? 'performance' : organization.plan;

  const activeBusinessId = cookies().get(ACTIVE_BUSINESS_COOKIE)?.value;
  const business = resolveActiveBusiness(businesses ?? [], activeBusinessId);

  return {
    userId: user.id,
    userEmail: user.email ?? '',
    organization: complimentary ? { ...organization, plan: effectivePlan } : organization,
    business,
    businesses: businesses ?? [],
    businessLimit: getBusinessLimit(effectivePlan),
    isComplimentary: complimentary,
  };
}

/** Igual que requireOrgContext pero además exige que el negocio ya exista. */
export async function requireBusinessContext(): Promise<OrgContext & { business: Business }> {
  const ctx = await requireOrgContext();
  if (!ctx.business) {
    redirect('/onboarding/business');
  }
  return ctx as OrgContext & { business: Business };
}
