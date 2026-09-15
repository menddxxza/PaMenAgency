-- Red de seguridad tras perder el contenido de una nota sin explicación clara:
-- una única copia de la versión con la que se abrió la nota, para poder volver
-- atrás un paso si algo la sobrescribe durante la sesión de edición. No es un
-- historial completo (solo la última "foto" al abrir, ver obtenerNota en
-- app/(app)/notas/actions.ts), pero cuesta una columna y cubre el caso real.
alter table notes add column if not exists content_anterior jsonb;
