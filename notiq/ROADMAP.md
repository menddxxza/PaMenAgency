# Roadmap de Notiq

12 semanas hasta el lanzamiento. Lo marcado como hecho es lo que ya está en este
repositorio; el resto es el plan.

## Semanas 1-2 · MVP base — hecho

- [x] Auth con Auth.js sobre Neon (email + contraseña, sesión JWT, middleware)
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
- [ ] Sesión compartida con Auth.js
- [ ] Notificaciones push con Expo Notifications
- [ ] Cron de recordatorios (`tasks.recordar_el` ya está en el esquema)

## Semanas 7-8 · Monetización — hecho (falta dar de alta los productos)

- [x] Stripe Checkout para Pro y Team
- [x] Portal de cliente para gestionar la suscripción
- [x] Webhook que escribe `users.plan`
- [x] Estado de la suscripción en Ajustes (prueba, cobro fallido, cancelada)
- [x] Productos Notiq Pro (9 €) y Notiq Team (19 €) creados en Stripe, en modo live
- [ ] Configurar `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y el endpoint del webhook
- [ ] Cobro por asiento en Team (hoy va a `quantity: 1`)
- [ ] Avisos al acercarse al límite del plan

## Migración de Supabase a Neon — hecho, sin verificar contra una base real

- [x] Esquema en `migrations/0001_neon.sql`: `users` sustituye a `auth.users` +
      `profiles`, sin RLS
- [x] Auth.js con provider de credenciales (bcrypt) y sesión JWT
- [x] Toda la capa de datos reescrita sobre `postgres.js`, con comprobación de
      propiedad explícita en cada consulta (ya no la hace Postgres por RLS)
- [x] `stripe_evento_en` protegido igual que antes; sin trigger porque ya no hay
      distinción de roles de Postgres que proteger
- [ ] **Probar contra un Neon real**: el entorno donde se escribió no tenía salida de
      red hacia Neon. Ver la lista de verificación del README.

## Semanas 9-10 · Pulido

- [ ] Onboarding con una nota de ejemplo ya escrita
- [ ] Etiquetas en la interfaz (el esquema ya las soporta)
- [ ] Imágenes en las notas (Neon no tiene Storage propio; haría falta S3, R2 o similar)
- [ ] Paleta de comandos y atajos de teclado
- [ ] Papelera para recuperar notas borradas
- [ ] Enlace mágico (login sin contraseña), si aparece un proveedor de email

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

**Neon sin RLS, con comprobación de propiedad en cada consulta.** Se migró por una
limitación del entorno de desarrollo (sin salida de red hacia otros backends), no
porque Supabase se hubiera quedado corto. La renuncia es real: sin RLS, la seguridad
depende de que el código de cada consulta no se olvide del `where user_id = ...`, y
Postgres ya no lo respalda si algo se escapa.
