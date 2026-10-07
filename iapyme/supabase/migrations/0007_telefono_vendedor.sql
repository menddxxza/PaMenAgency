-- =============================================================================
-- 0007 · Teléfono del vendedor
--
-- Para el "Ver teléfono" al estilo Milanuncios en fichas de servicios,
-- profesionales y trabajos — categorías donde una llamada suele ir más
-- rápido que escribir. Una sola columna, igual de pendiente de pegar a mano
-- que las anteriores: Supabase → tu proyecto IAPyme → SQL Editor → pega
-- esto → Run. Idempotente.
--
-- Hasta que lo ejecutes, el campo "Teléfono" del perfil simplemente no
-- aparece (ni al guardar ni al mostrarlo) — no rompe nada de lo que ya hay.
-- =============================================================================

alter table profiles add column if not exists telefono text;
