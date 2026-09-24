-- ---------------------------------------------------------------------------
-- 0004: campos de contacto real en leads (para importación por CSV y envío
-- real de email) + activación de Supabase Realtime en las tablas que
-- alimentan los paneles en vivo (dashboard por negocio).
-- ---------------------------------------------------------------------------

alter table public.leads
  add column if not exists email text,
  add column if not exists phone text;

-- Añade cada tabla a la publicación de Realtime sólo si no está ya
-- (idempotente: se puede volver a ejecutar sin error).
do $$
begin
  begin
    execute 'alter publication supabase_realtime add table public.agent_tasks';
  exception when duplicate_object then null;
  end;
  begin
    execute 'alter publication supabase_realtime add table public.leads';
  exception when duplicate_object then null;
  end;
  begin
    execute 'alter publication supabase_realtime add table public.revenue_events';
  exception when duplicate_object then null;
  end;
  begin
    execute 'alter publication supabase_realtime add table public.agents';
  exception when duplicate_object then null;
  end;
  begin
    execute 'alter publication supabase_realtime add table public.opportunities';
  exception when duplicate_object then null;
  end;
end $$;
