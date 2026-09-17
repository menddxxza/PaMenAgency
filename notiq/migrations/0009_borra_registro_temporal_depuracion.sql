-- Ya encontrada la causa (no era un bug de guardado: era el propio botón
-- "Recuperar versión anterior", ver el commit que lo quita) — se borra la
-- tabla temporal de depuración de migrations/0008.
drop table if exists debug_log;
