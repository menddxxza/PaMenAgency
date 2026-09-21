# Alta de un cliente nuevo (checklist repetible)

El bot no lleva datos en el código: lo que sabe de cada negocio sale del panel
(servicios y precios, horario, preguntas frecuentes, tono). Dar de alta un cliente
es rellenar esas tablas y conectar su número. Mismo proceso para todos.

## 1. Datos que hay que pedir al cliente (una sola reunión)
- Nombre del negocio, dirección, teléfono actual.
- Lista de servicios con precio (y duración aproximada).
- Horario real (incluidos festivos y cierres).
- 5-10 preguntas que le hacen siempre (cómo pagar, aparcamiento, política de
  cancelación, promociones...) con SU respuesta.
- Tono: cercano / profesional / directo / divertido.
- Quién recibe los avisos cuando el bot no sabe contestar.

## 2. Alta en Atiende
1. El dueño crea la cuenta en atiendeapp.es (o se invita al equipo); `create_business()`
   crea negocio, `bot_config` y la prueba gratuita de 5 días.
2. Panel → Configuración: servicios y precios, datos del negocio.
3. `businesses.opening_hours` (JSON `{"lunes-viernes": "10:00-14:00 y 16:00-20:00", ...}`;
   solo valores de texto, se le pasan tal cual al bot) y `bot_config.tone`,
   `bot_config.knowledge_base = {"faqs":[{"question":"...","answer":"..."}]}`.
4. `bot_config.faq_auto_reply = true` **solo cuando lo demás esté revisado por el dueño**.

## 3. Conectar WhatsApp
1. Registrar el número del negocio en Meta (Cloud API) bajo el portfolio de PaMen
   Agency. Un único usuario del sistema con token permanente sirve para todos los
   números de ese portfolio (secreto `WHATSAPP_TOKEN`).
2. `businesses.whatsapp_number` = ese número (con prefijo de país). El webhook
   (`whatsapp-webhook`) enruta cada mensaje al negocio por ese número.
3. Confirmar que el webhook sigue suscrito al campo `messages`.

## 4. Antes de abrir a clientas
- El dueño prueba el bot con 10 preguntas reales, incluidas las raras.
- Aviso al dueño de que la IA gratuita puede usar los mensajes para mejorar el
  proveedor; firmar el acuerdo de encargado de tratamiento (RGPD) y actualizar la
  política de privacidad del negocio.
- Semana 1: revisar a diario Conversaciones y los registros de las funciones.

## 5. Límites conocidos (decirlo al cliente)
- El bot no agenda ni confirma citas solo: recoge servicio y día/hora y el equipo
  confirma. Cancelaciones, cobros y quejas pasan al equipo.
- Si no sabe algo, la clienta recibe un aviso amable y el equipo lo ve en el panel.
  No hay todavía notificación activa al dueño.
