-- ============================================================
-- 002 — Búsqueda de componentes en Postgres
-- ============================================================
-- El buscador de la home busca vehículos Y componentes (`#/` del
-- prototipo). `vehicle` ya tenía `search_vector` + trigger; `component`
-- no tenía nada, así que se replica el mismo patrón para no acabar
-- filtrando en memoria en el servidor.
--
-- Índice trigram sobre el texto plano para tolerar erratas
-- ("intercoler", "tubo"), y tsvector para la búsqueda por palabras.
-- Igual que en `vehicle`, la configuración es 'simple' + unaccent:
-- el catálogo es español pero está lleno de códigos y siglas.
--
-- Idempotente.
-- ============================================================

ALTER TABLE component ADD COLUMN IF NOT EXISTS search_text   text;
ALTER TABLE component ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION component_search_refresh() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE txt text;
BEGIN
  SELECT unaccent(concat_ws(' ',
    NEW.code, NEW.name, NEW.description, NEW.position_note, NEW.material,
    s.code, s.name, sub.code, sub.name))
  INTO txt
  FROM subsystem sub
  JOIN system s ON s.id = sub.system_id
  WHERE sub.id = NEW.subsystem_id;

  NEW.search_text   := lower(coalesce(txt, ''));
  NEW.search_vector := to_tsvector('simple', coalesce(txt, ''));
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_component_search ON component;
CREATE TRIGGER trg_component_search
BEFORE INSERT OR UPDATE ON component
FOR EACH ROW EXECUTE FUNCTION component_search_refresh();

CREATE INDEX IF NOT EXISTS idx_component_search      ON component USING gin (search_vector);
CREATE INDEX IF NOT EXISTS idx_component_search_trgm ON component USING gin (search_text gin_trgm_ops);

-- Mismo tratamiento para vehicle: el trigger existente solo llenaba
-- tsvector, sin texto plano sobre el que hacer trigram, y solo con el
-- código interno de motor (nadie busca "CRLB").
ALTER TABLE vehicle ADD COLUMN IF NOT EXISTS search_text text;

CREATE OR REPLACE FUNCTION vehicle_search_refresh() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE txt text;
BEGIN
  -- Se indexa lo que la gente escribe de verdad: "leon 2.0 tdi 150",
  -- no el código interno del motor. De ahí la cilindrada en litros, la
  -- potencia en CV y el slug con los guiones abiertos a espacios.
  SELECT unaccent(concat_ws(' ',
    mf.name, m.name, g.name, g.slug, e.code, e.family,
    NEW.trim, NEW.year_start::text, NEW.year_end::text, bs.name,
    replace(NEW.slug, '-', ' '),
    to_char(e.displacement_cc / 1000.0, 'FM9D0'),
    e.fuel::text,
    round(e.power_kw * 1.35962)::text || ' cv',
    e.power_kw::text || ' kw'))
  INTO txt
  FROM generation g
  JOIN model m ON m.id = g.model_id
  JOIN manufacturer mf ON mf.id = m.manufacturer_id
  JOIN engine e ON e.id = NEW.engine_id
  JOIN body_style bs ON bs.id = NEW.body_style_id
  WHERE g.id = NEW.generation_id;

  NEW.search_text   := lower(coalesce(txt, ''));
  NEW.search_vector := to_tsvector('simple', coalesce(txt, ''));
  RETURN NEW;
END $$;

CREATE INDEX IF NOT EXISTS idx_vehicle_search_trgm ON vehicle USING gin (search_text gin_trgm_ops);

-- Refresca lo ya insertado con la nueva definición de los triggers.
UPDATE vehicle   SET slug = slug WHERE search_text IS NULL OR search_text NOT LIKE '%cv%';
UPDATE component SET code = code WHERE search_text IS NULL;
