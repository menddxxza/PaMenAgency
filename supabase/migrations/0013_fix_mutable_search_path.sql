-- =========================================================
-- FIJAR search_path EN LAS FUNCIONES SECURITY DEFINER
-- =========================================================
--
-- get_advisors marcaba estas 9 funciones con "Function Search Path
-- Mutable": sin un search_path fijo, una función SECURITY DEFINER puede
-- acabar resolviendo un nombre de tabla/función contra un esquema
-- distinto del que se pretendía si alguien logra crear un objeto con el
-- mismo nombre en un esquema anterior en el search_path de la sesión que
-- llama. Fijarlo a `public, pg_temp` hace que la función siempre resuelva
-- contra el esquema public real, sin importar qué search_path tenga quien
-- la invoque.
alter function auth_business_ids() set search_path = public, pg_temp;
alter function handle_inbound_message(uuid, text, text, text, text) set search_path = public, pg_temp;
alter function due_appointment_reminders() set search_path = public, pg_temp;
alter function mark_reminder_sent(uuid) set search_path = public, pg_temp;
alter function next_invoice_number(uuid, text) set search_path = public, pg_temp;
alter function create_invoice(uuid, uuid, text, date, date, text, numeric, jsonb) set search_path = public, pg_temp;
alter function receive_supplier_order(uuid) set search_path = public, pg_temp;
alter function business_plan(uuid) set search_path = public, pg_temp;
alter function create_business(text, text, text) set search_path = public, pg_temp;
