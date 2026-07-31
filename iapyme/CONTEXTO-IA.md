# IAPyme — Contexto del proyecto (para pasar a otra IA)

Documento autocontenido. Si estás leyendo esto sin haber visto el resto de la
conversación, aquí tienes todo lo necesario para continuar el trabajo sin perder nada.

## La idea

**IAPyme** es el primer marketplace vertical de soluciones de IA en español, donde
cualquier persona puede **comprar y vender** automatizaciones, agentes, bots, apps, webs,
SaaS, scripts y templates — cosas listas para usar, no cursos ni PDFs.

**El problema real:** el fundador tiene un producto (Atiende, un agente de IA para
atención al cliente por WhatsApp) y, al buscar clientes, descubrió que no existe ningún
marketplace en español para vender este tipo de soluciones. Tuvo que buscar clientes uno
a uno. Ese mismo problema lo viven miles de developers y freelancers de IA
hispanohablantes.

**El hueco de mercado:**

| Plataforma | Por qué no sirve |
|---|---|
| Flippa / Acquire | En inglés, para operaciones de 5 cifras |
| Gumroad / Hotmart | Infoproductos y cursos, no proyectos técnicos |
| Wallapop / Milanuncios | Generalistas, sin ficha técnica ni garantías |
| GitHub Marketplace | Solo extensiones, no proyectos completos |

**Lo que NO es:** ni una tienda cerrada del fundador, ni un Wallapop genérico, ni un
Flippa en español, ni un Hotmart de IA. Es abierto: cualquiera compra, cualquiera vende.

**Propuesta de valor exacta:**
- Al comprador: una solución de IA funcionando en 5 minutos, sin contratar a nadie.
- Al vendedor: sube tu proyecto una vez y véndelo mil veces sin dar soporte uno a uno.

La plataforma es en español; el producto que se vende puede estar en español o inglés.

## Decisión de negocio clave: gratis hasta que haya volumen

**IAPyme no cobra nada al principio.** Ni comisión por venta, ni cuota de vendedor, ni
plan de comprador. La razón: nadie se fía de un marketplace nuevo que además cobra.

Importante no confundir esto: los **productos no son gratis** (el comprador paga al
vendedor desde el día uno), lo gratis es **usar la plataforma** (IAPyme se lleva 0 %).
Regalar el catálogo atraería curiosos en vez de pymes con presupuesto.

**Consecuencia técnica:** si IAPyme se lleva un 0 % de cada venta, montar Stripe Connect
(la pieza más lenta de construir: cuentas conectadas, KYC, webhooks) no aporta nada al
negocio todavía. Por eso el MVP (Fase 1) sale **sin pasarela de pago** — solo catálogo,
fichas y un botón de "pedir información" que genera un lead. El pago entra en la Fase 2,
ya construido con la comisión a 0 %, para poder activarla más adelante cambiando un
número, no rehaciendo el flujo.

La monetización (Fase 5) se activa por **umbrales**, no por fecha: ≥100 productos
publicados, ≥30 ventas/mes dentro de la plataforma, y ≥3.000 visitas orgánicas/mes a la
vez. El tercero es el que importa: significa que IAPyme trae clientes que el vendedor no
tenía, y ahí cobrar es defendible.

## Catálogo de salida (5 productos del fundador, vendedor #1)

1. **Atiende** — Atención al cliente 24/7 por WhatsApp. Setup 197€ + 29€/mes. 30 min.
2. **Agente de Citas para Clínicas Dentales** — Agenda en software dental. 297€ + 49€/mes. 1h.
3. **Bot de Facturación** para autónomos/pymes — genera y registra facturas. 147€ + 19€/mes. 45 min.
4. **Asistente de Contenido para Redes Sociales** — 30 posts/mes. 97€ + 39€/mes. 15 min.
5. **Resumidor de Reuniones** — transcribe Meet/Zoom, manda acuerdos a Slack. 197€ + 29€/mes. 20 min.

## Las 10 categorías verticales

Atención al cliente · Salud y clínicas · Finanzas y facturación · Marketing y contenido ·
Productividad · Ventas y CRM · Ecommerce · Educación · Legal y compliance · Recursos humanos.

## Stack técnico

```
Frontend:  Next.js 14 (App Router) + Tailwind + shadcn/ui
Backend:   Supabase (Postgres + Auth + Storage + RLS)
Pagos:     Stripe Connect (a partir de la Fase 2, comisión a 0 % hasta la Fase 5)
Email:     Resend
Hosting:   Vercel
Analytics: Plausible
```

Todo en capa gratuita mientras no haya tracción.

## Estado actual del repo

Repo: `menddxxza/menddxxza` (repo del producto Atiende, distinto a IAPyme).
IAPyme vive aislado en la carpeta `iapyme/`, con su propio `package.json`.
Rama de trabajo: `claude/revision-archivos-proyecto-bop2gl`.
PR abierto (borrador): https://github.com/menddxxza/menddxxza/pull/3

**Construido y en el PR:**

- `iapyme/app/page.tsx` y componentes (`Header`, `Footer`, `Logo`, `ProductoCard`,
  `WaitlistForm`) — **landing de validación (Fase 0)**, en producción-ready: hero con doble
  CTA, el hueco de mercado, las 10 categorías, el catálogo de los 5 productos, cómo
  funciona (comprador/vendedor), lista de espera, FAQ.
- `iapyme/app/api/waitlist/route.ts` — endpoint que valida y guarda altas en Supabase
  (tabla `waitlist`, ver `iapyme/supabase/waitlist.sql`). Funciona sin Supabase
  configurado: si no hay credenciales, registra en logs y confirma igual al usuario.
- `iapyme/lib/categorias.ts` y `iapyme/lib/productos.ts` — **fuente de verdad del
  contenido**, pensados para reutilizarse tal cual en el marketplace real.
- `iapyme/lib/supabase.ts` — cliente de servicio (service role), nunca expuesto al cliente.
- SEO: `layout.tsx` con metadatos/OG, `sitemap.ts`, `robots.ts`.
- `iapyme/README.md` — cómo correr el proyecto y qué falta para cerrar la Fase 0.
- `iapyme/ROADMAP.md` — **el plan de fases completo**, con puertas numéricas para pasar
  de una fase a otra (no fechas). Es la referencia principal para saber qué construir y
  en qué orden.

**Verificado:** build y typecheck en verde, landing recorrida en navegador real (1440px y
390px, sin overflow horizontal), formulario probado de punta a punta, API rechazando
inputs inválidos.

**No construido todavía:** nada del marketplace en sí (auth, catálogo real con datos de
Supabase, publicación de productos, leads, moderación, pagos). Solo existe la landing de
validación y la planificación.

## El plan de fases (resumen — el detalle completo está en `iapyme/ROADMAP.md`)

- **Fase 0 — Validación** ✅ construida. Falta: comprar dominio, desplegar, publicar en
  redes, medir 7 días. Puerta: ≥50 emails y ≥10 de perfil vendedor.
- **Fase 1 — MVP sin pagos** (2 semanas): auth, catálogo público con buscador/filtros,
  fichas de producto, asistente de publicación en 4 pasos, leads como sustituto del pago,
  moderación obligatoria en `/admin` antes de publicar nada.
- **Fase 2 — Transacción al 0 %** (2-3 semanas): Stripe Connect, checkout, pedidos con
  estados, entrega de archivos, el vendedor cobra cuando el comprador confirma que
  funciona (escrow ligero), reviews solo de compradores verificados, mensajería, facturas.
- **Fase 3 — SEO y confianza** (en paralelo con la 4): landing por categoría, datos
  estructurados, contenido semanal, analytics de vendedor.
- **Fase 4 — Reclutar vendedores** (continuo desde el día 1): no es técnica, es la que más
  decide si el proyecto sale. Objetivo: 50 productos de 15+ vendedores.
- **Fase 5 — Monetización**: se activa por los tres umbrales de arriba, no por fecha.
  Orden de encendido: comisión escalonada (5/10/15 % según tipo) → suscripción vendedor
  29€/mes → plan comprador Pro 49€/mes. Los vendedores fundadores conservan 0 % durante 6
  meses aunque ya se cobre a los demás.
- **Fase 6 — Escala** (mes 6+): escrow completo, afiliados, newsletter, API pública,
  internacionalización a LATAM.

## Siguiente paso concreto (donde se retoma el trabajo)

Empezar la **Fase 1**, en este orden:

1. Proyecto de Supabase + schema (`profiles`, `categories`, `products`, `leads`,
   `product_views`) con RLS, triggers de `updated_at`, índices `pg_trgm`/GIN.
2. Auth: registro/login email + Google, perfil automático al registrarse.
3. Catálogo público: home, página de categoría, ficha de producto — con datos reales.
4. Buscador y filtros (precio, tiempo de instalación, requisitos, idioma).
5. Asistente de publicación de producto + subida a Supabase Storage.
6. Sistema de leads: botón "pedir información" + bandeja del vendedor.
7. Cola de moderación en `/admin`.
8. Publicar los 5 productos del catálogo de salida y abrir la Fase 1.

## Riesgo a vigilar

El riesgo explícito del propio fundador: **quedarse construyendo el marketplace perfecto
y no lanzarlo nunca**. Por eso cada fase tiene una puerta con números, no un alcance
abierto. Si algo no está en la lista de una fase, no se construye en esa fase.
