# Atiende — documentación completa del proyecto

Este documento resume **todo lo que hay dentro de la app**, tal y como está hoy: qué hace cada pantalla, cómo está montado el negocio (planes, pagos), y dónde vive cada pieza técnica (Supabase, Stripe, dominio, etc.). Pensado para que sirva de referencia rápida sin tener que rebuscar en el código.

---

## 1. Qué es Atiende

Atiende es una app de gestión para negocios locales (clínicas, peluquerías/salones, talleres) que reciben citas y consultas por WhatsApp. Conecta el WhatsApp del negocio con un bot de IA que responde preguntas frecuentes y agenda citas solo, y da un panel para llevar agenda, clientes, facturación e inventario desde un único sitio.

Es **multi-negocio**: una misma cuenta puede gestionar varios negocios (útil si se trabaja como agencia para varios clientes), y **multi-usuario** por negocio (owner + miembros del equipo).

---

## 2. Planes y precios

| Plan | Precio | Incluye |
|---|---|---|
| **Starter** | 19€/mes | Citas (hasta 50/mes), Conversaciones + bot de WhatsApp, 1 usuario, 1 negocio |
| **Pro** | 49€/mes | Citas ilimitadas, Clientes (CRM), Facturación, Inventario, Estadísticas, hasta 5 usuarios, 1 negocio |
| **Agencia** | 99€/mes | Todo lo de Pro, negocios y equipo ilimitados, soporte prioritario |

- Sin suscripción activa, no se puede entrar al panel (se muestra la pantalla de planes).
- Los planes Pro/Agencia son necesarios para acceder a Clientes, Facturación, Inventario y Estadísticas — Starter solo tiene Citas y Conversaciones. Esto se aplica tanto en la interfaz como en la base de datos (nadie puede saltárselo aunque manipule la app).
- **Cuentas founder** (`mendozitadjerez@gmail.com` y `amandacurbelo18@gmail.com`): acceso automático al plan Agencia, gratis, sin pasar por Stripe.

---

## 3. Página pública (Landing — atiendeapp.es)

- **Navegación**: enlaces a "Cómo funciona", "Casos de uso", "Precios", además de Iniciar sesión / Empezar.
- **Hero**: titular + mockup de una conversación de WhatsApp con el bot, con un efecto de paralaje sutil que sigue al ratón.
- **Problema**: 3 tarjetas con los dolores típicos (citas perdidas, clientes que no llegan, horas perdidas en tareas manuales).
- **Solución**: cuadrícula con los 6 pilares del producto (bot de WhatsApp con IA destacado, recordatorios, agenda, facturación, inventario, multi-negocio).
- **Cómo funciona**: proceso en 3 pasos numerados.
- **Casos de uso**: pestañas por tipo de negocio (Clínicas, Peluquerías y salones, Talleres), cada una con su propio texto.
- **Precios**: los 3 planes con botón para empezar.
- Todas las secciones tienen animación de aparición al hacer scroll (se puede desactivar sola si el sistema del visitante tiene activado "reducir movimiento").

---

## 4. Acceso a la cuenta

- **Signup** (`/signup`): registro con email + contraseña, envía un correo de confirmación (con el enlace apuntando ya al dominio real).
- **Login** (`/login`): email + contraseña.
- **Forgot password** (`/forgot-password`): recuperación de contraseña por email.
- Tras confirmar el email, si el usuario no tiene negocio creado se le lleva a **Onboarding** para crear su primer negocio (nombre, slug, número de WhatsApp).
- El correo de la app se envía desde `soporte.Atiende@gmail.com` (SMTP propio configurado en Supabase, ya probado y funcionando).

---

## 5. Panel interno (`/app/...`)

Todas estas páginas viven detrás de login + negocio creado + suscripción activa.

- **Dashboard** — resumen: próximas citas, citas por confirmar, conversaciones abiertas, número de clientes.
- **Citas** — agenda de citas (reservadas por el bot o manualmente), con filtro por estado (pendiente/confirmada/completada/cancelada/no asistió) y acciones rápidas para cambiar el estado.
- **Clientes** *(Pro/Agencia)* — listado de clientes con búsqueda por nombre/teléfono, número de citas por cliente, y ficha de cliente con historial y documentos adjuntos (contratos, fotos antes/después, etc. vía Storage privado).
- **Conversaciones** — bandeja de chats de WhatsApp en vivo: se puede tomar el control de cualquier conversación cuando el bot no llega, con vista tipo chat.
- **Facturación** *(Pro/Agencia)* — presupuestos y facturas con numeración correlativa por negocio/tipo/año, líneas ligadas a servicios, estados (borrador/enviada/pagada/cancelada).
- **Inventario** *(Pro/Agencia)* — artículos con cantidad, unidad, precio de compra, mínimo de stock y caducidad; alertas de stock bajo y de caducidad próxima; pedidos a proveedores que al marcarse como recibidos reponen el stock automáticamente.
- **Estadísticas** *(Pro/Agencia)* — gráficas del negocio (citas, conversaciones, conversión del bot).
- **Configuración** — datos del negocio (nombre, WhatsApp, zona horaria), configuración del bot (tono, recordatorios automáticos con horas de antelación configurables, respuesta automática de IA a preguntas frecuentes con base de conocimiento editable), servicios ofrecidos, y gestión del equipo (invitar/eliminar miembros).
- **Suscripción** — ver plan actual, cambiar de plan, o gestionar la suscripción/facturación desde el Billing Portal de Stripe.

---

## 6. Seguridad

- Aislamiento por negocio mediante Row Level Security (RLS) en todas las tablas — cada negocio solo ve sus propios datos.
- Todas las funciones con privilegios elevados (`SECURITY DEFINER`) tienen comprobaciones explícitas de pertenencia al negocio, para que nadie pueda leer o escribir datos de un negocio ajeno aunque llame a la función directamente.
- Revisión de seguridad completa realizada antes del lanzamiento; vulnerabilidades encontradas corregidas.

---

## 7. Infraestructura técnica (dónde está cada cosa)

| Pieza | Dónde vive |
|---|---|
| Frontend (React + Vite) | Repositorio GitHub → desplegado automáticamente en **Netlify** desde la rama de producción |
| Dominio | **atiendeapp.es**, comprado en Arsys, apuntando a Netlify con SSL |
| Base de datos, Auth, Storage, Realtime | **Supabase** (proyecto "Atiende", org "Agencia PaMen") |
| Lógica de servidor | Edge Functions de Supabase: `create-checkout-session`, `create-portal-session`, `stripe-webhook`, `invite-member`, `list-members`, `remove-member`, `get-business-config`, `generate-bot-reply`, `send-appointment-reminders`, `whatsapp-inbound` |
| Pagos | **Stripe en modo Live** — 3 productos/precios (Starter/Pro/Agencia), webhook configurado y verificado con un pago real |
| Correo transaccional | SMTP con `soporte.Atiende@gmail.com` |
| IA (bot de FAQ) | API de Anthropic (Claude) — activa cuando se configure `ANTHROPIC_API_KEY` |
| WhatsApp | **Pendiente** — se conecta con n8n + Meta WhatsApp Business API cuando un negocio real lo necesite (no es infraestructura global, se monta por negocio) |

Los secretos reales (claves de Stripe, Supabase, Anthropic, SMTP) están guardados únicamente en el panel de Supabase (Edge Functions → Secrets) y en Stripe — no están en este documento ni en el repositorio, por seguridad.

---

## 8. Diseño

- Paleta beige cálido + acento azul, validada para contraste y accesibilidad, aplicada tanto en la landing como en todo el panel interno.
- Copy en castellano de España (no rioplatense/latino).
- Animaciones de scroll y paralaje sutil en la landing, con soporte para "reducir movimiento".
- App instalable como PWA (se añade a la pantalla de inicio del móvil).

---

## 9. Material de marketing ya preparado

- One-pager en PDF con el resumen del producto y precios.
- Tarjetas de visita (frontal negro elegante "ATIENDE" + reverso con web y email), en formato individual y en plancha A4 de 10 tarjetas para imprimir en casa.
- Plantillas de email y WhatsApp para contactar negocios en frío, y guion de venta para llamada/visita.

---

## 10. Pendiente / próximos pasos

- Conectar WhatsApp real (n8n + Meta Business API) en cuanto el primer cliente de pago lo pida.
- Configurar `ANTHROPIC_API_KEY` en Supabase si se quiere activar el bot de respuestas automáticas por IA.
- Buscar los primeros clientes (Capterra, Google Ads, contacto directo con negocios locales).
