-- Añade a eltrio306@gmail.com a la lista de cuentas con acceso Pro automático
-- (junto a mendozitadjerez@gmail.com, dada de alta en 0003).

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
    case
      when lower(new.email) in ('mendozitadjerez@gmail.com', 'eltrio306@gmail.com') then 'pro'
      else 'free'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Por si la cuenta ya existía antes de esta migración.
update public.profiles
  set plan = 'pro'
  where lower(email) in ('mendozitadjerez@gmail.com', 'eltrio306@gmail.com');
