-- La tabla debug_log (migraciones 0008/0010) no registraba nada — puede ser
-- un problema de permisos del rol con el que se conecta la app. En vez de
-- seguir con eso, se reutiliza la propia tabla notes (ese camino de
-- escritura sí funciona, comprobado muchas veces ya) con dos columnas
-- temporales: qué bloques recibió el último guardarNota() y cuándo.
alter table notes add column if not exists debug_bloques jsonb;
alter table notes add column if not exists debug_momento timestamptz;
