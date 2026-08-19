-- Función atómica para comprobar y consumir el límite de búsquedas del plan free.
-- period_start = primer día del mes en curso (UTC).

create or replace function public.increment_usage_and_check_limit(
  p_user_id uuid,
  p_limit int
)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_period date := date_trunc('month', now())::date;
  v_count int;
begin
  insert into public.usage_counters (user_id, period_start, searches_count)
  values (p_user_id, v_period, 0)
  on conflict (user_id, period_start) do nothing;

  update public.usage_counters
    set searches_count = searches_count + 1
    where user_id = p_user_id and period_start = v_period
    returning searches_count into v_count;

  if p_limit is null then
    return true;
  end if;

  if v_count > p_limit then
    update public.usage_counters
      set searches_count = searches_count - 1
      where user_id = p_user_id and period_start = v_period;
    return false;
  end if;

  return true;
end;
$$;

grant execute on function public.increment_usage_and_check_limit(uuid, int) to authenticated;
