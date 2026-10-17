-- ============================================================
-- Comprobaciones de integridad del seed y de las reglas del proyecto.
--   psql "$DATABASE_URL" -f db/checks.sql
-- Falla con una excepción en la primera regla que se rompa.
-- ============================================================

DO $$
DECLARE n bigint;
BEGIN
  -- 1. Nada de datos de demo sin marcar.
  SELECT count(*) INTO n FROM component WHERE origin <> 'demo' AND status = 'published';
  IF n > 0 THEN
    RAISE EXCEPTION 'Hay % componentes publicados que no son demo y no se han verificado', n;
  END IF;

  -- 2. No inventar referencias OEM ni precios.
  SELECT count(*) INTO n FROM part_reference WHERE origin IN ('own', 'licensed', 'api');
  IF n > 0 THEN
    RAISE EXCEPTION 'Hay % referencias que se declaran verificadas sin fuente', n;
  END IF;
  SELECT count(*) INTO n FROM price_quote;
  IF n > 0 THEN
    RAISE EXCEPTION 'Hay % precios cargados sin proveedor con licencia', n;
  END IF;

  -- 3. Cero scraping: el CHECK de repair_procedure ya lo impone; se verifica.
  SELECT count(*) INTO n FROM repair_procedure WHERE origin NOT IN ('own', 'licensed', 'demo');
  IF n > 0 THEN
    RAISE EXCEPTION 'Procedimientos con origen no permitido: %', n;
  END IF;

  -- 4. Todo componente cuelga de un subsistema y de un sistema.
  SELECT count(*) INTO n
  FROM component c LEFT JOIN subsystem s ON s.id = c.subsystem_id WHERE s.id IS NULL;
  IF n > 0 THEN
    RAISE EXCEPTION '% componentes sin subsistema', n;
  END IF;

  -- 5. El código del componente coincide con SYS.SUBSYS.* de su jerarquía.
  SELECT count(*) INTO n
  FROM component c
  JOIN subsystem sub ON sub.id = c.subsystem_id
  JOIN system s ON s.id = sub.system_id
  WHERE c.code NOT LIKE s.code || '.' || sub.code || '.%';
  IF n > 0 THEN
    RAISE EXCEPTION '% componentes con código incoherente con su sistema/subsistema', n;
  END IF;

  -- 6. Las dependencias de desmontaje no forman ciclos de longitud 2.
  SELECT count(*) INTO n
  FROM component_dependency a JOIN component_dependency b
    ON a.component_id = b.requires_id AND a.requires_id = b.component_id;
  IF n > 0 THEN
    RAISE EXCEPTION 'Dependencias mutuas de desmontaje: %', n;
  END IF;

  -- 7. canonical_key es el hash de los IDs, no texto libre.
  SELECT count(*) INTO n
  FROM vehicle v
  WHERE v.canonical_key <> make_canonical_key(
    v.generation_id, v.body_style_id, v.engine_id, v.transmission_id,
    v.year_start, v.trim, v.market);
  IF n > 0 THEN
    RAISE EXCEPTION '% vehículos con canonical_key que no cuadra', n;
  END IF;

  -- 8. Un modelo publicado tiene al menos un nodo mapeado a componente.
  SELECT count(*) INTO n
  FROM model_3d m
  WHERE m.status = 'published'
    AND NOT EXISTS (
      SELECT 1 FROM model_node mn WHERE mn.model_3d_id = m.id AND mn.component_id IS NOT NULL);
  IF n > 0 THEN
    RAISE EXCEPTION '% modelos publicados sin ningún nodo mapeado', n;
  END IF;

  -- 9. Todo vehículo con componentes es EA288 2.0: es lo único descrito.
  SELECT count(*) INTO n
  FROM vehicle v JOIN engine e ON e.id = v.engine_id
  WHERE EXISTS (SELECT 1 FROM vehicle_component vc WHERE vc.vehicle_id = v.id)
    AND NOT (e.family = 'EA288' AND e.displacement_cc = 1968);
  IF n > 0 THEN
    RAISE EXCEPTION '% vehículos tienen componentes que no les constan verificados', n;
  END IF;

  RAISE NOTICE 'checks: todo correcto';
END $$;
