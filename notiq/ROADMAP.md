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
- [ ] Notificaciones push con Expo Notifications — para la futura app móvil.
      La web ya tiene las suyas (Web Push, ver más abajo); esto sería
      solo para cuando exista la app nativa.

## Recordatorios de verdad (notificaciones push) — código listo, pendiente de claves y una migración

`tasks.recordar_el` guardaba la fecha desde hacía tiempo, pero nada la
disparaba — esto es lo que faltaba.

- [ ] `migrations/0006_notificaciones_push.sql` añade la tabla
      `push_subscriptions`. **No se ha ejecutado contra el Neon real.**
- [x] Web Push del navegador (el estándar — no Expo Notifications, no SDK de
      terceros): `public/sw.js` recibe el push y muestra la notificación;
      `lib/push.ts` la manda desde el servidor con la librería `web-push`.
- [x] Par de claves VAPID: se generan una vez, propias de Notiq, sin cuenta
      externa (`npx web-push generate-vapid-keys`). Sin ellas configuradas,
      "Activar notificaciones" de Ajustes ni siquiera aparece — el resto de
      la app sigue igual.
- [x] `app/api/cron/recordatorios/route.ts` — revisa `tasks` con
      `recordar_el` cumplido y sin enviar, manda un push a cada dispositivo
      suscrito del usuario, y marca `recordatorio_enviado_el`. Protegido con
      `CRON_SECRET` (Vercel lo manda solo en el header cuando dispara el cron).
- [x] `vercel.json`: el cron corre **una vez al día** — el plan Hobby de
      Vercel no deja programarlos con más frecuencia. Un recordatorio puesto
      para las 9:00 puede no llegar hasta la pasada del día siguiente; si el
      proyecto pasa a Pro, basta con cambiar el "schedule" para que lleguen
      más cerca de la hora exacta.
- [x] "Activar notificaciones" en Ajustes — pide permiso, registra el
      service worker y guarda la suscripción; "Desactivar" hace lo contrario.

## Semanas 7-8 · Monetización — hecho (falta dar de alta los productos)

- [x] Stripe Checkout para Pro y Team
- [x] Portal de cliente para gestionar la suscripción
- [x] Webhook que escribe `users.plan`
- [x] Estado de la suscripción en Ajustes (prueba, cobro fallido, cancelada)
- [x] Productos Notiq Pro (9 €) y Notiq Team (19 €) creados en Stripe, en modo live
- [ ] Configurar `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y el endpoint del webhook
- [x] Cobro por asiento en Team — selector de personas al contratar/cambiar de
      plan; la cantidad no se guarda en Neon, se lee en caliente de Stripe
      (`subscription.items[0].quantity`) para no añadir otra migración
- [x] Avisos al acercarse al límite del plan — banner en Inicio (IA y notas) a
      partir del 80%, aviso más temprano en Notas (antes solo al 100%, ya
      bloqueado), cifras en rojo en Ajustes, y "Ampliar" en la cabecera ahora
      también le sale a Pro cerca del límite (antes solo a Free, siempre)

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

- [x] Onboarding con una nota de ejemplo ya escrita — se crea sola al
      registrarse (`app/entrar/actions.ts` → `notaDeBienvenida`), marcada
      como favorita para que sea lo primero que se vea; si falla no tumba el
      registro, solo se queda sin nota
- [x] Etiquetas en la interfaz — chips en la nota (con sugerencias) y filtro en la lista
- [x] Imágenes en las notas — arrastrar y soltar sobre Adjuntos (sigue guardando en
      Postgres como bytea, no en S3/R2; sube al mismo sitio que el botón de siempre)
- [x] Paleta de comandos (Ctrl/Cmd+K) y atajos de teclado (`n`, `t`)
- [x] Papelera para recuperar notas borradas — vista dentro de Notas, con restaurar y borrado definitivo
- [ ] Enlace mágico (login sin contraseña), si aparece un proveedor de email
- [x] Modo oscuro — toggle en Ajustes, sin parpadeo al cargar (script inline + `.dark` en `<html>`)
- [x] Plantillas de nota (reunión, lista de la compra, diario) al crear una nota nueva
- [x] Exportar una nota a Markdown (.md) o a PDF vía "Imprimir" del navegador
- [x] Notas relacionadas ("backlinks"): escribir `[[Título de otra nota]]` en el
      texto la enlaza; se detecta buscando en caliente, sin tabla nueva
- [x] "Recordar" en una nota crea una tarea con fecha de vencimiento enlazada a
      ella — no es una notificación push (eso sigue sin existir, ver el cron de
      arriba), solo aparece en Tareas con fecha
- [x] Menú de comandos "/" en el editor (como Notion): escribir "/" en un bloque
      de texto abre un desplegable para elegir el tipo de bloque
- [x] Bloque de tabla — celdas editables, filas/columnas dinámicas; sigue en
      `notes.content` (jsonb), sin tabla nueva
- [x] Duplicar nota — copia título, bloques y etiquetas; no copia adjuntos (ver
      el comentario en `duplicarNota`, `app/(app)/notas/actions.ts`)

## Comparado con Notion, con más trabajo por detrás — no entraron en esta ronda

- [ ] Icono/emoji por nota (Notion lo tiene en cada página) — necesita una
      columna nueva (`notes.icono`), mismo patrón de migración pendiente que
      "compartir por enlace" más abajo
- [ ] Páginas anidadas / jerarquía infinita — Notiq solo tiene un nivel de
      carpetas, no notas dentro de notas; cambio de modelo de datos grande
- [ ] Comentarios y menciones @persona, edición colaborativa en tiempo real —
      Notiq es de un solo usuario por cuenta, esto es una categoría de trabajo
      aparte (no solo backend: presencia, resolución de conflictos)
- [ ] Importar desde Notion/Evernote/Google Docs
- [ ] Historial de versiones de una nota (deshacer más allá de la sesión actual)

## Compartir por enlace — código fusionado a la rama principal, sigue pendiente de una migración

- [ ] `migrations/0003_notas_compartidas.sql` añade `notes.compartir_publico`.
      **No se ha ejecutado contra el Neon real** — hasta que no se ejecute, este
      código no se despliega (una nota sin esa columna rompería cualquier
      apertura de nota en producción). Ver el aviso en el propio fichero de
      migración para el comando exacto.

## Estudio — pestaña nueva

A partir del documento de visión "todo lo que un estudiante necesita" —
implementadas las piezas que se decidió construir primero; el resto (grabar
clase, generador de exámenes, flashcards con dominio, modo examen) sí entró.

- [x] `migrations/0004_estudio.sql` (`flashcards`, `examenes`,
      `intentos_examen`) — **ejecutada contra el Neon real y en producción.**
- [x] Flashcards con dominio: 🔴 a repasar / 🟡 en progreso / 🟢 dominada,
      repetición espaciada simple (acertar aleja la fecha del próximo
      repaso, fallar la trae a hoy) — `responderFlashcard`, `app/(app)/estudio/actions.ts`
- [x] "Repaso de hoy": hasta 15 flashcards, priorizando falladas > en
      progreso atrasadas > nuevas
- [x] Generador de exámenes tipo test (4 opciones, dificultad elegible) con
      corrección en el servidor y análisis de fallos por tema
- [x] "Repasar mis errores": las preguntas falladas de un examen se
      convierten en flashcards nuevas, sin otra llamada a la IA (la
      respuesta correcta ya estaba en el examen)
- [x] Grabar clase → transcripción (Whisper vía Groq, mismo proveedor y
      clave que el resto de la IA, sin cuenta aparte) → apuntes
      estructurados guardados como nota normal → flashcards de la propia
      transcripción
- [x] Progreso por carpeta: recuento de flashcards en cada estado, usado
      como "tema" en vez de crear una entidad "asignatura" aparte
- [x] Modo examen "de verdad": `migrations/0005_examen_fecha.sql` añade
      `folders.fecha_examen` (**sin ejecutar todavía, ver más abajo**).
      Cuenta atrás + % de preparación estimada (dominadas/total del tema) +
      plan de repaso día a día — el plan sale de una regla fija en
      `lib/estudio.ts` (simulacro los dos últimos días, alterna repasar/test
      el resto), no de una llamada a la IA. Se pone la fecha desde la lista
      "Progreso por tema" de Estudio.
- [ ] Buscar dentro de una clase grabada ("¿cuándo habló de la mitosis?") —
      necesitaría guardar la transcripción con marcas de tiempo, hoy se
      descarta el detalle temporal al convertirla en apuntes

## Modo examen — código listo, pendiente de otra migración

- [ ] `migrations/0005_examen_fecha.sql` añade `folders.fecha_examen`. **No se
      ha ejecutado contra el Neon real** — sin ella, `obtenerEstudioInicial()`
      rompería al leer una columna que no existe (la pestaña Estudio entera,
      no solo el modo examen). Igual que las anteriores: pegar el SQL en el
      SQL Editor de Neon, o `psql "$DATABASE_URL" -f migrations/0005_examen_fecha.sql`.

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
