-- Acceso completo permanente para la cuenta de administración de LeadScope:
-- se registra o ya existe, siempre queda en plan Pro (sin límite de búsquedas).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, plan)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    case when lower(new.email) = 'mendozitadjerez@gmail.com' then 'pro' else 'free' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Por si la cuenta ya existía antes de esta migración.
update public.profiles
  set plan = 'pro'
  where lower(email) = 'mendozitadjerez@gmail.com';
