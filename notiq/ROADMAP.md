# Roadmap de Notiq

12 semanas hasta el lanzamiento. Lo marcado como hecho es lo que ya está en este
repositorio; el resto es el plan.

## Semanas 1-2 · MVP base — hecho

- [x] Auth con Supabase (contraseña y magic link, PKCE, middleware de sesión)
- [x] CRUD de notas con editor por bloques, carpetas y borrado suave
- [x] CRUD de tareas con estado, prioridad y vencimiento
- [x] UI responsive con navegación lateral

## Semanas 3-4 · IA integrada — hecho

- [x] Resúmenes de notas con `gpt-4o-mini`, guardados para no repagarlos
- [x] Extracción de tareas desde una nota, con revisión antes de insertarlas
- [x] Asistente con contexto de notas y tareas
- [x] Cuota de IA por plan, contada de forma atómica en Postgres
- [x] Búsqueda full-text en español con `ts_rank`

## Semanas 5-6 · App móvil

- [ ] Proyecto Expo + React Native reutilizando `lib/`
- [ ] Sesión compartida con Supabase Auth
- [ ] Notificaciones push con Expo Notifications
- [ ] Cron de recordatorios (`tasks.recordar_el` ya está en el esquema)

## Semanas 7-8 · Monetización — hecho (falta dar de alta los productos)

- [x] Stripe Checkout para Pro y Team
- [x] Portal de cliente para gestionar la suscripción
- [x] Webhook que escribe `profiles.plan` con la service role key
- [x] Estado de la suscripción en Ajustes (prueba, cobro fallido, cancelada)
- [ ] Crear los precios de Notiq en la cuenta de Stripe y configurar `STRIPE_PRICE_*`
- [ ] Cobro por asiento en Team (hoy va a `quantity: 1`)
- [ ] Avisos al acercarse al límite del plan

## Semanas 9-10 · Pulido

- [ ] Onboarding con una nota de ejemplo ya escrita
- [ ] Etiquetas en la interfaz (el esquema ya las soporta)
- [ ] Imágenes en las notas, sobre Supabase Storage
- [ ] Paleta de comandos y atajos de teclado
- [ ] Papelera para recuperar notas borradas

## Semanas 11-12 · Lanzamiento

- [ ] Landing definitiva con capturas reales
- [ ] Product Hunt
- [ ] Primeros 100 usuarios

## Decisiones tomadas

**Bloques en jsonb, markdown derivado.** Guardar markdown obligaría a reparsear en
cada tecla y perdería el estado por bloque (una tarea marcada, el lenguaje de un
bloque de código). El markdown se genera cuando hace falta.

**Full-text antes que embeddings.** Mantener un índice vectorial al día con
autoguardado cada 900 ms es un coste fijo por cada tecla. Con el volumen de una cuenta
personal el full-text de Postgres responde bien. Se revisará si aparecen cuentas con
miles de notas.

**Textarea por bloque, no contenteditable.** Menos vistoso de implementar, mucho más
predecible en móvil y con lector de pantalla.

**La cuota se cobra antes de llamar al modelo.** Un error del proveedor le cuesta al
usuario una operación de su cuota; al revés, le costaría dinero al negocio.

**Nada que hable con el usuario escribe el plan.** El checkout solo abre el pago; el
plan lo escribe el webhook cuando Stripe confirma el cobro. Si lo marcara la ruta de
checkout, bastaría con abrirlo y cerrarlo para tener Pro gratis.

**`past_due` mantiene el plan.** Regalar unos días a quien tiene la tarjeta caducada
sale más barato que perder al cliente. La baja real llega por
`customer.subscription.deleted`.
