-- =========================================================
-- CIERRE DE FUNCIONES SECURITY DEFINER LLAMABLES SIN SESIÓN
-- =========================================================
--
-- El linter de seguridad de Supabase (get_advisors) detectó que
-- handle_inbound_message, due_appointment_reminders y mark_reminder_sent
-- seguían siendo ejecutables por el rol `anon` (cualquier visitante sin
-- iniciar sesión, usando solo la clave pública que va incrustada en el
-- propio bundle de la web). Los migrations 0001/0003 ya llevaban el
-- revoke/grant por escrito, pero comprobado contra la base de datos real
-- (has_function_privilege) nunca se llegó a ejecutar en producción — solo
-- quedó en el archivo.
--
-- Impacto real mientras estuvo así, sin ningún control interno en las tres:
--   * handle_inbound_message: cualquiera podía inyectar mensajes/clientes
--     falsos en CUALQUIER negocio, pasando el business_id a mano.
--   * due_appointment_reminders: cualquiera podía leer teléfono y nombre de
--     los clientes con cita próxima de TODOS los negocios de la plataforma.
--   * mark_reminder_sent: cualquiera podía desactivar el recordatorio de
--     cualquier cita de cualquier negocio.
--
-- Estas tres solo las deben llamar n8n y los Edge Functions con la
-- service_role key, nunca el navegador de un visitante.
--
-- IMPORTANTE: `revoke ... from public` NO basta aquí. Supabase concede
-- EXECUTE a `anon` y `authenticated` de forma DIRECTA sobre cada función
-- nueva del esquema public (vía default privileges), no a través del
-- pseudo-rol PUBLIC — así que revocar de PUBLIC no quita nada real.
-- Comprobado con has_function_privilege('anon', ..., 'EXECUTE') antes y
-- después: solo revocando de anon/authenticated explícitamente cambia el
-- resultado a false. Si en el futuro se bloquea otra función así,
-- verificar siempre contra la base de datos real, no solo por el nombre
-- del comando.
revoke execute on function handle_inbound_message(uuid, text, text, text, text) from anon, authenticated;
grant execute on function handle_inbound_message(uuid, text, text, text, text) to service_role;

revoke execute on function due_appointment_reminders() from anon, authenticated;
grant execute on function due_appointment_reminders() to service_role;

revoke execute on function mark_reminder_sent(uuid) from anon, authenticated;
grant execute on function mark_reminder_sent(uuid) to service_role;

-- next_invoice_number no tiene ningún control interno (a diferencia de
-- create_invoice, que sí comprueba membership antes de llamarla), y el
-- frontend nunca la llama directamente — solo create_invoice la usa
-- internamente. Sin este cierre, cualquiera podía hacer avanzar el
-- contador de facturas de cualquier negocio llamándola con su business_id,
-- creando huecos en la numeración. Al ser SECURITY DEFINER, create_invoice
-- puede seguir llamándola aunque el propio rol que ejecuta create_invoice
-- ya no tenga permiso para llamarla directamente.
revoke execute on function next_invoice_number(uuid, text) from anon, authenticated;
grant execute on function next_invoice_number(uuid, text) to service_role;
