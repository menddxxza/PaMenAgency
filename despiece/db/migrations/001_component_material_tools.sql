-- ============================================================
-- 001 — Material y herramientas a nivel de COMPONENTE
-- ============================================================
-- El catálogo del prototipo (constante `C` de app.html) describe, por
-- componente: material y herramientas necesarias. El esquema núcleo no
-- tenía sitio para ninguna de las dos cosas:
--
--   * material     — no existía columna.
--   * herramientas — `tool` solo se podía asociar a un `repair_procedure`,
--                    y todavía no hay procedimientos redactados (fase 2).
--
-- Se añaden en la capa CONCEPTUAL (`component`), que es donde vive esa
-- información: el material del turbo no depende de la referencia comprable.
-- Cuando existan `repair_procedure`, `procedure_tool` seguirá siendo la
-- lista de herramientas del procedimiento concreto; `component_tool` es la
-- lista orientativa del componente.
--
-- Idempotente.
-- ============================================================

ALTER TABLE component ADD COLUMN IF NOT EXISTS material text;

CREATE TABLE IF NOT EXISTS component_tool (
  component_id uuid NOT NULL REFERENCES component(id) ON DELETE CASCADE,
  tool_id      uuid NOT NULL REFERENCES tool(id) ON DELETE CASCADE,
  PRIMARY KEY (component_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_component_tool_tool ON component_tool (tool_id);
