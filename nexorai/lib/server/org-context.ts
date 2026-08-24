import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Business, Organization } from '@/lib/types';

export interface OrgContext {
  userId: string;
  userEmail: string;
  organization: Organization;
  business: Business | null;
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

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('organization_id', membership.organization_id)
    .maybeSingle();

  return {
    userId: user.id,
    userEmail: user.email ?? '',
    organization,
    business: business ?? null,
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
