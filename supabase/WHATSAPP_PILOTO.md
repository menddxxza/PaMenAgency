# Piloto de WhatsApp sin n8n (All Nails)

Flujo: Meta → `whatsapp-webhook` → `whatsapp-inbound` (RPC `handle_inbound_message`)
→ `generate-bot-reply` (Claude) → respuesta por la Cloud API.

## 1. Meta (developers.facebook.com)
1. Crear app tipo "Business" y añadir el producto WhatsApp.
2. Anotar el **App Secret** (Configuración de la app → Básica).
3. En WhatsApp → Configuración de API: usar el **número de pruebas**, añadir hasta 5
   teléfonos destinatarios y generar un token. El temporal caduca en 24 h; para uso
   continuo crear un token permanente con un usuario del sistema.
4. Webhook: URL `https://whbnseutymxdvoesdqml.supabase.co/functions/v1/whatsapp-webhook`,
   token de verificación = el que pongas en `WHATSAPP_VERIFY_TOKEN`, y suscribirse al
   campo `messages`.

## 2. Secretos en Supabase (los pones tú, no se pegan en chats ni en git)
```
supabase secrets set WHATSAPP_VERIFY_TOKEN=... META_APP_SECRET=... WHATSAPP_TOKEN=... --project-ref whbnseutymxdvoesdqml
```
`ANTHROPIC_API_KEY` ya debería existir (comprobar).

## 3. Despliegue
- `whatsapp-webhook`: **sin verify_jwt** (`--no-verify-jwt`); la seguridad es la firma de Meta.
- `whatsapp-inbound` y `generate-bot-reply`: con verify_jwt por defecto (ya comprueban service_role).

## 4. Datos del negocio (rellenar con datos reales de All Nails, nada inventado)
- `businesses.whatsapp_number`: el número de pruebas de Meta tal como aparece en el
  panel (solo se comparan los dígitos).
- `bot_config.faq_auto_reply = true` y `bot_config.knowledge_base = {"faqs":[{"question":"...","answer":"..."}]}`.
- `services` con precio y duración; `businesses.opening_hours`.

## Limitaciones conocidas
- Solo mensajes de texto; sin deduplicar reintentos de Meta (se responde 200 al momento).
- Un único `WHATSAPP_TOKEN` global: para varios negocios habrá que guardar token y
  `phone_number_id` por negocio.
- El bot no agenda citas: `generate-bot-reply` pasa a humano cualquier petición de cita.
- Aviso al dueño cuando hay handoff: pendiente (fuera de la ventana de 24 h exige plantilla de pago).

## Alternativa para probar sin Meta: sandbox de Twilio
Función `whatsapp-twilio` (desplegar sin verify_jwt). Solo para pruebas.
1. Cuenta de Twilio (prueba gratuita) → Messaging → Try it out → WhatsApp sandbox.
2. Unirse desde el móvil enviando `join <palabra>` al número del sandbox (la sesión caduca a las 72 h).
3. En Sandbox settings, "When a message comes in" = `https://whbnseutymxdvoesdqml.supabase.co/functions/v1/whatsapp-twilio` (POST).
4. Secreto en Supabase: `TWILIO_AUTH_TOKEN` (Auth Token de la consola de Twilio).
5. `businesses.whatsapp_number` = número del sandbox de Twilio.
