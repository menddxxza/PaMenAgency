-- ============================================================
-- 004 — Búsqueda: funciones RPC
-- ============================================================
-- La búsqueda vive en Postgres (pg_trgm + tsvector), no en el servidor
-- de Next. `sobra hasta ~500k vehículos` — decisión de stack.
--
-- Estrategia por consulta:
--   1. prefijo/substring sobre search_text  → rápido y literal
--   2. tsvector con to_tsquery de prefijos  → por palabras
--   3. word_similarity() trigram            → tolera erratas
--      (word_similarity y no similarity: la consulta es corta y el
--       documento largo, similarity() siempre saldría por debajo del
--       umbral; `<%` compara contra la mejor subcadena)
-- Se ordena por similitud descendente y se corta por `lim`.
--
-- STABLE + security invoker (por defecto): las políticas RLS aplican.
-- Idempotente.
-- ============================================================

CREATE OR REPLACE FUNCTION search_norm(q text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT lower(unaccent(coalesce(q, '')));
$$;

-- to_tsquery seguro: cada palabra como prefijo, unidas por AND.
CREATE OR REPLACE FUNCTION search_tsquery(q text) RETURNS tsquery
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE words text[];
BEGIN
  SELECT array_agg(w || ':*')
  INTO words
  FROM unnest(regexp_split_to_array(regexp_replace(search_norm(q), '[^a-z0-9 ]', ' ', 'g'), '\s+')) AS w
  WHERE length(w) > 0;

  IF words IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN to_tsquery('simple', array_to_string(words, ' & '));
END $$;

CREATE OR REPLACE FUNCTION search_vehicles(q text DEFAULT '', lim integer DEFAULT 24)
RETURNS SETOF vehicle_full
LANGUAGE sql STABLE AS $$
  WITH n AS (SELECT search_norm(q) AS t, search_tsquery(q) AS ts)
  SELECT v.*
  FROM vehicle_full v
  JOIN vehicle vb ON vb.id = v.id
  CROSS JOIN n
  WHERE v.status = 'published'
    AND (
      n.t = ''
      OR vb.search_text LIKE '%' || n.t || '%'
      OR (n.ts IS NOT NULL AND vb.search_vector @@ n.ts)
      OR n.t <% vb.search_text
    )
  ORDER BY
    CASE WHEN n.t = '' THEN 0 ELSE 1 END,
    word_similarity(n.t, vb.search_text) DESC,
    v.year_start DESC, v.slug
  LIMIT greatest(1, least(lim, 100));
$$;

CREATE OR REPLACE FUNCTION search_components(q text DEFAULT '', lim integer DEFAULT 24)
RETURNS SETOF component_full
LANGUAGE sql STABLE AS $$
  WITH n AS (SELECT search_norm(q) AS t, search_tsquery(q) AS ts)
  SELECT c.*
  FROM component_full c
  JOIN component cb ON cb.id = c.id
  CROSS JOIN n
  WHERE c.status = 'published'
    AND n.t <> ''
    AND (
      cb.search_text LIKE '%' || n.t || '%'
      OR (n.ts IS NOT NULL AND cb.search_vector @@ n.ts)
      OR n.t <% cb.search_text
    )
  ORDER BY word_similarity(n.t, cb.search_text) DESC, c.system_sort, c.code
  LIMIT greatest(1, least(lim, 100));
$$;

-- Componentes de un vehículo concreto (tabla puente vehicle_component).
CREATE OR REPLACE FUNCTION vehicle_components(p_slug text)
RETURNS SETOF component_full
LANGUAGE sql STABLE AS $$
  SELECT c.*
  FROM component_full c
  JOIN vehicle_component vc ON vc.component_id = c.id
  JOIN vehicle v ON v.id = vc.vehicle_id
  WHERE v.slug = p_slug AND c.status = 'published'
  ORDER BY c.system_sort, c.code;
$$;
