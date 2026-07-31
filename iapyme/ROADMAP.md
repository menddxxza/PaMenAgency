# IAPyme — Plan de fases

Documento vivo. Define **qué se construye, en qué orden, y qué tiene que pasar para
pasar de una fase a la siguiente**.

---

## Principio rector: gratis hasta que haya volumen

IAPyme **no cobra nada** en las primeras fases. Ni comisión por venta, ni cuota de
vendedor, ni plan de comprador. Nadie se fía de un marketplace nuevo que además cobra.

Conviene ser preciso con qué es gratis, porque es fácil confundirlo:

| Quién | Qué paga | Cuándo |
|---|---|---|
| El comprador | El precio del producto, **al vendedor** | Desde el primer día |
| El vendedor | **Nada a IAPyme** | Hasta la Fase 5 |
| IAPyme | Ingresa 0 € | Hasta la Fase 5 |

Los productos **no son gratis**. Regalar el catálogo atraería curiosos en lugar de pymes
con presupuesto, y luego sería muy difícil empezar a cobrar por lo mismo. Lo gratis es
**usar la plataforma**.

**Consecuencia directa sobre el orden de construcción:** si IAPyme se lleva un 0 % de cada
transacción, procesar el pago dentro de la web no aporta nada al negocio todavía, y Stripe
Connect es la pieza más lenta de construir de todo el proyecto (cuentas conectadas, KYC,
webhooks, reembolsos, facturación). Por eso **la Fase 1 sale sin pasarela** y el pago entra
en la Fase 2, ya al 0 %. Se gana entrar en el mercado semanas antes.

---

## Mapa de fases

| Fase | Qué es | Duración | Estado |
|---|---|---|---|
| 0 | Validación con landing | 1–2 semanas | ✅ Construida |
| 1 | MVP: catálogo, fichas y contacto | 2 semanas | ⏳ Siguiente |
| 2 | Transacción: pagos al 0 % | 2–3 semanas | Pendiente |
| 3 | Confianza y SEO | 3–4 semanas | Pendiente |
| 4 | Oferta: reclutar vendedores | Continuo desde Fase 1 | Pendiente |
| 5 | Monetización | Cuando se cumplan los umbrales | Pendiente |
| 6 | Escala | Mes 6 en adelante | Pendiente |

---

## Fase 0 — Validación ✅

**Objetivo:** saber si hay alguien al otro lado antes de construir el marketplace.

Ya está construida: landing en `iapyme/` con captación de emails segmentada entre
comprador y vendedor.

**Falta por hacer:**

- [ ] Comprar `iapyme.es`.
- [ ] Desplegar en Vercel (Root Directory = `iapyme`).
- [ ] Crear el proyecto de Supabase y ejecutar `supabase/waitlist.sql`.
- [ ] Dar de alta el dominio en Plausible.
- [ ] Publicar el post de validación en LinkedIn y Twitter.

**Puerta para pasar a la Fase 1** (medir a los 7 días):

- ≥ 50 emails en total, **y**
- ≥ 10 de perfil `vendedor` o `ambos`.

La segunda condición es la que manda. Un marketplace sin oferta no existe: cien
compradores mirando un catálogo vacío no valen nada. Si hay compradores pero no
vendedores, no se construye todavía — se van a buscar vendedores a mano.

---

## Fase 1 — MVP: catálogo, fichas y contacto

**Duración: 2 semanas. Sin pagos.**

**Objetivo:** que exista un sitio real donde un vendedor publica su solución y una pyme la
encuentra y contacta. Es el escaparate con ficha técnica que hoy no existe en español.

### Qué se construye

**Autenticación**
- Registro y login con email y con Google (Supabase Auth).
- Perfil que se crea solo al registrarse (trigger).
- Roles: `buyer`, `seller`, `admin`. Cualquiera puede pasar a vendedor sin aprobación previa.

**Catálogo público**
- Home con buscador y las 10 categorías.
- Página por categoría con filtros: precio, tiempo de instalación, requisitos, idioma del producto.
- Búsqueda por texto (`pg_trgm`) y por etiquetas (índice GIN).
- Ficha de producto: problema → solución → qué hace → qué necesitas, galería, demo, precio.
- Perfil público del vendedor.

**Publicar producto**
- Asistente de 4 pasos: básico, ficha, precio, entrega.
- Subida de imágenes y vídeo a Supabase Storage.
- Guardado como borrador en cualquier punto.

**Contacto (lo que sustituye al pago)**
- Botón «Pedir información» en cada ficha → crea un `lead`.
- El vendedor ve sus leads en el panel y responde por email.
- El trato se cierra fuera de la plataforma, entre las dos partes.

**Panel de vendedor (mínimo)**
- Lista de productos con visitas y leads recibidos.
- Bandeja de leads.

**Moderación**
- Cola de revisión en `/admin`. Ninguna ficha se publica sin pasar por ahí.
- Es lo único que impide que IAPyme derive en un tablón de anuncios. Al principio se
  revisa a mano; con volumen se automatiza.

### Base de datos

Tablas: `profiles`, `categories`, `products`, `leads`, `product_views`.
Con RLS, triggers de `updated_at` e índices de búsqueda.

`orders`, `reviews` y `seller_subscriptions` se crean en su fase. No se adelantan.

### Qué NO se hace en esta fase

Pagos, checkout, Stripe, reviews, mensajería interna, entrega de archivos, analytics
avanzados, suscripciones. Nada de eso hace falta para saber si la gente publica y contacta.

### Hecho cuando

- Un vendedor que no seas tú publica un producto de principio a fin sin ayuda.
- Una pyme encuentra ese producto por el buscador y deja un lead.
- Los 5 productos del catálogo de salida están publicados.

---

## Fase 2 — Transacción: pagos al 0 %

**Duración: 2–3 semanas.**

**Objetivo:** que la compra ocurra dentro de IAPyme. Sigue sin cobrarse comisión, pero la
plataforma pasa a ser el sitio donde se cierra el trato, no solo donde se descubre.

Esto es lo que convierte el escaparate en marketplace. Mientras el dinero se mueva fuera,
no hay datos de ventas, ni reviews verificadas, ni ranking honesto, ni ninguna razón para
volver.

### Qué se construye

- **Stripe Connect**: cuenta conectada por vendedor, KYC, transferencias.
- **Checkout**: pago único, setup + mensualidad, o suscripción. IVA incluido.
- **Comisión configurable, puesta a 0 %.** Se construye el mecanismo desde el principio y
  se deja a cero. Encenderlo en la Fase 5 será cambiar un número, no reescribir el flujo.
- **Pedidos**: estados `pending → paid → delivered → confirmed`, con reembolso y cancelación.
- **Entrega**: archivos, credenciales y guía que el vendedor sube al pedido.
- **Confirmación del comprador**: el vendedor cobra cuando el comprador confirma que
  funciona. Escrow ligero, y es lo que hace que una pyme se atreva con un pedido de 297 €
  a alguien que no conoce.
- **Reviews verificadas**: solo puede opinar quien tiene un pedido pagado de ese producto.
- **Mensajería** entre comprador y vendedor sobre un pedido o un lead.
- **Facturas** descargables para el comprador.
- **Emails transaccionales** con Resend: pedido, entrega, recordatorios.

### Base de datos

Se añaden `orders`, `reviews`, `messages`, `deliveries`, `stripe_accounts`.

### Hecho cuando

- 10 pedidos reales pagados dentro de la plataforma.
- Al menos 3 vendedores distintos han cobrado.
- Cero incidencias de dinero sin resolver.

---

## Fase 3 — Confianza y SEO

**Duración: 3–4 semanas. En paralelo con la Fase 4.**

**Objetivo:** que la gente llegue sola. El SEO es la ventaja estructural del proyecto —
«IA para pymes» es una keyword enorme en español y nadie la está trabajando en vertical.

- Landing por categoría, optimizada para su keyword («agente de IA para clínicas dentales»).
- Datos estructurados de producto y review (rich snippets en Google).
- Sitemap dinámico y SSR de todas las fichas.
- Blog o casos de uso: 1 pieza por semana, cada una apuntando a una categoría.
- Señales de confianza: vendedor verificado, tiempo de respuesta, número de instalaciones.
- Analytics de vendedor: visitas, conversión por ficha, de dónde llega la gente.
- Comunidad en Discord o Telegram.

**Hecho cuando:** 1.000 visitas orgánicas al mes y al menos un producto vendido a alguien
que llegó por búsqueda, no por tus redes.

---

## Fase 4 — Oferta: reclutar vendedores

**Continuo, empieza el día que arranca la Fase 1.**

No es una fase técnica y es la que más determina si esto sale. El catálogo se llena a mano
hasta que se llena solo.

- Tú eres el vendedor #1: los 5 productos del catálogo de salida, más automatizaciones n8n
  sueltas. Meta: 10 productos tuyos.
- Invitar uno a uno a developers y freelancers de IA hispanohablantes. Objetivo: 10 externos.
- Argumento: **cero comisión, cero cuota, y quedas destacado en portada.** Ahora mismo la
  alternativa de esa gente es perseguir clientes por LinkedIn.
- Programa de vendedor fundador: los primeros conservan el 0 % de comisión durante 6 meses
  aunque la plataforma ya cobre a los demás. Eso hay que respetarlo cuando llegue la Fase 5.

**Hecho cuando:** 50 productos publicados de al menos 15 vendedores distintos.

---

## Fase 5 — Monetización

**No tiene fecha. Tiene umbrales.**

Se empieza a cobrar cuando la plataforma ya vale más de lo que va a cobrar. Cobrar antes
mata la oferta; cobrar después es dejar dinero encima de la mesa.

### Interruptores

Se activa la comisión cuando se cumplan **las tres cosas a la vez**:

1. ≥ 100 productos publicados.
2. ≥ 30 ventas al mes dentro de la plataforma.
3. ≥ 3.000 visitas orgánicas al mes.

El tercero es el que importa: significa que IAPyme trae clientes que el vendedor no tenía.
Ese es el momento en que cobrar es justo y defendible.

### Cómo se enciende

1. **Comisión primero**, y escalonada: 5 % en producto digital, 10 % con instalación, 15 %
   en servicio a medida. Se anuncia con 30 días de antelación y respetando a los fundadores.
2. **Suscripción de vendedor (29 €/mes)** después, y solo cuando los analytics y la ficha
   destacada valgan de verdad ese dinero.
3. **Plan de comprador Pro (49 €/mes)** el último. Es el más difícil de justificar y el que
   menos ingresa al principio.

### A dónde lleva

Con los números del plan de negocio: ~1.350 €/mes en el mes 6, ~6.840 €/mes en el mes 12 y
~32.000 €/mes en el mes 24. Para 1 M €/año hacen falta unos 85.000 €/mes de GMV.

---

## Fase 6 — Escala

**Mes 6 en adelante.**

- Escrow completo para servicios a medida con hitos.
- Programa de afiliados.
- Newsletter semanal por categoría.
- Colaboraciones con divulgadores de IA en español.
- API pública y widget para que un vendedor incruste su ficha en su web.
- Internacionalización a LATAM (mismo idioma, pasarelas y fiscalidad distintas).

---

## Riesgos

| Riesgo | Por qué duele | Qué lo contiene |
|---|---|---|
| **Construir el marketplace perfecto y no lanzarlo** | Es el riesgo real del proyecto, y está escrito en el propio contexto | Cada fase tiene una puerta con números. Si no se cumple, no se sigue construyendo: se arregla |
| Catálogo vacío | Un marketplace sin oferta no existe | Fase 4 empieza el día 1, no cuando esté la web |
| Producto malo publicado | Una mala compra y esa pyme no vuelve nunca | Moderación obligatoria desde la Fase 1 |
| Los tratos se cierran fuera y no vuelven | Sin transacción dentro no hay datos, ni reviews, ni negocio | La Fase 2 tiene que llegar rápido tras la 1 |
| Empezar a cobrar demasiado pronto | Se va la oferta, que es lo más caro de conseguir | Los tres umbrales de la Fase 5, sin excepciones |

---

## Por dónde se empieza mañana

Orden concreto de construcción de la Fase 1:

1. Proyecto de Supabase + schema (`profiles`, `categories`, `products`, `leads`) con RLS.
2. Auth: registro, login, Google, perfil automático.
3. Catálogo público: home, categoría, ficha. Con datos de prueba.
4. Buscador y filtros.
5. Asistente de publicación + subida a Storage.
6. Leads: botón de contacto y bandeja del vendedor.
7. Cola de moderación en `/admin`.
8. Publicar los 5 productos del catálogo de salida y abrir.
