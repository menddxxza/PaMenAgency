-- Permite más de un negocio por organización (antes limitado a 1:1 en el MVP).
-- El límite ahora se aplica en la aplicación según el plan contratado
-- (ver lib/plans.ts -> getBusinessLimit), no en el esquema.

alter table public.businesses drop constraint if exists businesses_organization_id_key;

create index if not exists businesses_organization_idx on public.businesses (organization_id, created_at);
