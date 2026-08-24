-- Nexorai: esquema inicial
-- Multi-tenant por organization_id. Flujo: Organization -> Business -> Goal ->
-- Opportunity -> Agent -> AgentTask -> Lead -> RevenueEvent.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: 1 fila por usuario de auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- organizations: el tenant. Todo lo demás cuelga de organization_id.
-- ---------------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  plan text not null default 'starter' check (plan in ('starter', 'pro', 'business', 'performance')),
  success_fee_pct numeric not null default 0 check (success_fee_pct >= 0 and success_fee_pct <= 100),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;

-- Helper: ¿pertenece el usuario actual a esta organización?
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships m
    where m.organization_id = org_id and m.user_id = auth.uid()
  );
$$;

create policy "organizations_select_member" on public.organizations
  for select using (public.is_org_member(id));

create policy "organizations_insert_self" on public.organizations
  for insert with check (created_by = auth.uid());

create policy "organizations_update_member" on public.organizations
  for update using (public.is_org_member(id));

create policy "memberships_select_own_org" on public.memberships
  for select using (public.is_org_member(organization_id));

create policy "memberships_insert_self" on public.memberships
  for insert with check (user_id = auth.uid());

-- Crea el perfil automáticamente al registrarse.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- businesses: el negocio del cliente (1 por organización en el MVP)
-- ---------------------------------------------------------------------------
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  -- Un negocio por organización en el MVP (preparado para 1:N a futuro: basta
  -- con quitar este unique cuando se soporte más de un negocio por tenant).
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  name text not null,
  sector text not null,
  location text,
  website text,
  employees_range text,
  main_problem text,
  acquisition_channels text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.businesses enable row level security;

create policy "businesses_all_member" on public.businesses
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- business_metrics: snapshot histórico (nunca se sobreescribe, se versiona)
-- ---------------------------------------------------------------------------
create table if not exists public.business_metrics (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  avg_ticket numeric,
  current_customers int,
  monthly_revenue numeric,
  monthly_leads int,
  conversion_rate numeric,
  created_at timestamptz not null default now()
);

create index if not exists business_metrics_business_idx on public.business_metrics (business_id, created_at desc);

alter table public.business_metrics enable row level security;

create policy "business_metrics_all_member" on public.business_metrics
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- goals: "¿cuánto quieres crecer?"
-- ---------------------------------------------------------------------------
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  goal_type text not null check (goal_type in ('new_customers', 'revenue', 'leads', 'reactivation')),
  target_value numeric not null check (target_value > 0),
  timeframe_days int not null default 30,
  raw_input text,
  status text not null default 'active' check (status in ('active', 'achieved', 'archived')),
  created_at timestamptz not null default now()
);

create index if not exists goals_business_idx on public.goals (business_id, created_at desc);

alter table public.goals enable row level security;

create policy "goals_all_member" on public.goals
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- opportunities: generadas por el audit engine a partir de business+goal
-- ---------------------------------------------------------------------------
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  category text not null check (
    category in ('unfollowed_leads', 'reactivation', 'prospecting', 'automation', 'conversion_optimization')
  ),
  name text not null,
  description text not null,
  assumption text not null default '',
  potential_min numeric not null,
  potential_max numeric not null,
  difficulty text not null check (difficulty in ('baja', 'media', 'alta')),
  estimated_days int not null,
  probability text not null check (probability in ('baja', 'media', 'alta')),
  estimated_cost numeric not null default 0,
  roi_multiple numeric not null,
  priority int not null default 0,
  status text not null default 'suggested' check (status in ('suggested', 'activated', 'dismissed')),
  activated_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists opportunities_business_idx on public.opportunities (business_id, priority desc);

alter table public.opportunities enable row level security;

create policy "opportunities_all_member" on public.opportunities
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- agents: instancias del catálogo, activadas por el usuario
-- ---------------------------------------------------------------------------
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  key text not null check (
    key in ('lead_hunter', 'lead_qualifier', 'sales_assistant', 'follow_up', 'reactivation', 'revenue_analyst')
  ),
  name text not null,
  status text not null default 'idle' check (status in ('idle', 'active', 'paused', 'error')),
  requires_approval boolean not null default true,
  is_marketplace_listed boolean not null default false,
  owner_organization_id uuid references public.organizations(id) on delete set null,
  cost_to_date numeric not null default 0,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  unique (business_id, key)
);

create index if not exists agents_org_idx on public.agents (organization_id);

alter table public.agents enable row level security;

create policy "agents_all_member" on public.agents
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- agent_tasks: unidades de trabajo de un agente
-- ---------------------------------------------------------------------------
create table if not exists public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  title text not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'done', 'failed')),
  result_summary text,
  is_simulated boolean not null default true,
  scheduled_for timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists agent_tasks_agent_idx on public.agent_tasks (agent_id, scheduled_for);

alter table public.agent_tasks enable row level security;

create policy "agent_tasks_all_member" on public.agent_tasks
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- leads: prospectos encontrados/gestionados por los agentes
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  name text not null,
  source text,
  status text not null default 'new' check (
    status in ('new', 'contacted', 'qualified', 'converted', 'lost')
  ),
  estimated_value numeric,
  is_simulated boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_business_idx on public.leads (business_id, status);

alter table public.leads enable row level security;

create policy "leads_all_member" on public.leads
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- campaigns: agrupación opcional de tareas/leads (preparado, sin UI en el MVP)
-- ---------------------------------------------------------------------------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed')),
  created_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;

create policy "campaigns_all_member" on public.campaigns
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- conversations: hilo de seguimiento de un lead (preparado, sin UI en el MVP)
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  channel text not null default 'whatsapp' check (channel in ('whatsapp', 'email', 'phone', 'other')),
  last_message text,
  is_simulated boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.conversations enable row level security;

create policy "conversations_all_member" on public.conversations
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- actions: recomendaciones del Action Center
-- ---------------------------------------------------------------------------
create table if not exists public.actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'recommended' check (status in ('recommended', 'activated', 'dismissed')),
  created_at timestamptz not null default now()
);

alter table public.actions enable row level security;

create policy "actions_all_member" on public.actions
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- revenue_events: atribución de ingreso (real o potencial), base del success fee
-- ---------------------------------------------------------------------------
create table if not exists public.revenue_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  agent_id uuid references public.agents(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  kind text not null check (kind in ('potential', 'attributed', 'confirmed')),
  amount numeric not null,
  is_simulated boolean not null default true,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists revenue_events_business_idx on public.revenue_events (business_id, occurred_at);

alter table public.revenue_events enable row level security;

create policy "revenue_events_all_member" on public.revenue_events
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- subscriptions: plan contratado
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  plan text not null check (plan in ('starter', 'pro', 'business', 'performance')),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled', 'trialing')),
  stripe_customer_id text,
  stripe_subscription_id text,
  success_fee_pct numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_all_member" on public.subscriptions
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- usage: contadores de consumo por periodo (tareas de agente ejecutadas, etc.)
-- ---------------------------------------------------------------------------
create table if not exists public.usage_counters (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  period_start date not null,
  agent_tasks_count int not null default 0,
  leads_count int not null default 0,
  primary key (organization_id, period_start)
);

alter table public.usage_counters enable row level security;

create policy "usage_counters_select_member" on public.usage_counters
  for select using (public.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- audit_log: traza de eventos de producto y acciones sensibles
-- ---------------------------------------------------------------------------
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  event text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_org_idx on public.audit_log (organization_id, created_at desc);

alter table public.audit_log enable row level security;

create policy "audit_log_select_member" on public.audit_log
  for select using (organization_id is null or public.is_org_member(organization_id));

create policy "audit_log_insert_member" on public.audit_log
  for insert with check (organization_id is null or public.is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute procedure public.set_updated_at();

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute procedure public.set_updated_at();

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute procedure public.set_updated_at();

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute procedure public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute procedure public.set_updated_at();
