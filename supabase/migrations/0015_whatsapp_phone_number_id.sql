-- =========================================================
-- ID DEL NÚMERO DE WHATSAPP (META) POR NEGOCIO
-- =========================================================
--
-- Para responder desde el panel por WhatsApp, la Cloud API necesita el
-- "Phone Number ID" del número del negocio (no es el teléfono, es el
-- identificador que Meta asigna al registrarlo). Hasta ahora solo se veía en
-- el evento entrante del webhook, así que no había forma de escribir a una
-- clienta por iniciativa del dueño.
--
-- No es un secreto (el token de acceso sí lo es y vive en los secretos de las
-- Edge Functions). Lo rellena PaMen Agency al registrar el número del cliente
-- en Meta; que esté o no rellenado es también lo que el panel enseña como
-- "WhatsApp conectado / pendiente de conexión".

alter table businesses add column if not exists whatsapp_phone_number_id text;

-- Un mismo número de Meta no puede pertenecer a dos negocios.
create unique index if not exists businesses_whatsapp_phone_number_id_key
  on businesses (whatsapp_phone_number_id)
  where whatsapp_phone_number_id is not null;
