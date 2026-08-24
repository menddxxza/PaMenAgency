-- =========================================================
-- ACTIVAR REALTIME para las tablas que el frontend escucha en vivo
-- =========================================================
-- useAppointments, useConversations y useMessages se suscriben a
-- postgres_changes vía supabase.channel(...) — pero eso solo recibe avisos
-- si la tabla está añadida a la publicación `supabase_realtime`. Sin este
-- paso, las suscripciones se conectan pero nunca reciben nada, y el panel
-- solo se actualiza al recargar la página (porque eso repite el fetch
-- inicial, no porque Realtime funcione).
alter publication supabase_realtime add table appointments;
alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table messages;
