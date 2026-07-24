-- =========================================================
-- Precio de compra por artículo de inventario
-- =========================================================
-- Necesario para el import por foto de albaranes: además del nombre y la
-- cantidad, un albarán casi siempre trae el precio por unidad, y no había
-- ninguna columna donde guardarlo.
alter table inventory_items add column unit_price numeric(10, 2);
