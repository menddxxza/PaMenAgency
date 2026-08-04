# IAPyme — Landing de validación

Landing de la Fase 0 de [IAPyme](../): el marketplace vertical de soluciones de IA en
español. Su único trabajo es **medir demanda antes de construir el marketplace**:
captar emails segmentados entre quien quiere comprar y quien quiere vender.

Next.js 14 (App Router) + Tailwind + Supabase. Pensada para desplegarse en Vercel en
capa gratuita.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # opcional, la landing arranca sin nada de esto
npm run dev
```

## Variables de entorno

Todas son opcionales: sin ninguna configurada la landing se despliega y funciona, y los
apuntes de la lista de espera se registran en los logs del servidor en lugar de guardarse.

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL canónica en metadatos, `sitemap.xml` y `robots.txt`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Proyecto de Supabase donde guardar la lista de espera. |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio. **Solo servidor**, nunca en el cliente. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Dominio en Plausible. Vacío = no se carga analítica. |

## Base de datos

Ejecuta [`supabase/waitlist.sql`](supabase/waitlist.sql) en el SQL Editor de Supabase. Crea
la tabla `waitlist` con RLS activo y sin políticas: solo es accesible desde el servidor con
la service role key, así que nadie puede leer los emails desde el navegador.

Para ver los resultados de la validación:

```sql
select perfil, count(*) from public.waitlist group by perfil order by 2 desc;
select email, perfil, mensaje, origen, created_at from public.waitlist order by created_at desc;
```

El campo `origen` distingue si el alta vino del formulario del hero o del de cierre, para
saber cuánta gente necesita leerse la página entera antes de apuntarse.

## Estructura

```
app/
  page.tsx              Landing completa (hero, hueco de mercado, categorías,
                        catálogo, cómo funciona, lista de espera, FAQ)
  layout.tsx            Metadatos SEO/OG y carga condicional de Plausible
  api/waitlist/route.ts Alta en la lista de espera con validación en servidor
  sitemap.ts robots.ts  SEO
components/             Header, Footer, Logo, ProductoCard, WaitlistForm
lib/
  categorias.ts         Las 10 categorías verticales (slugs = seed de Supabase)
  productos.ts          Los 5 productos del catálogo de salida
  supabase.ts           Cliente de servicio (devuelve null si no hay config)
supabase/waitlist.sql   Esquema de la tabla waitlist
```

`lib/categorias.ts` y `lib/productos.ts` son la fuente de verdad del contenido y están
pensados para reutilizarse tal cual cuando se monte el MVP del marketplace.

## Despliegue en Vercel

1. Importa el repo y pon **Root Directory** en `iapyme`.
2. Añade las variables de entorno que vayas a usar.
3. Deploy. Framework y comandos los detecta solos.

## Qué falta para cerrar la Fase 0

- [ ] Comprar `iapyme.es` y apuntarlo a Vercel.
- [ ] Crear el proyecto de Supabase y ejecutar `waitlist.sql`.
- [ ] Dar de alta el dominio en Plausible.
- [ ] Publicar el post de validación en LinkedIn/Twitter apuntando aquí.
- [ ] Medir 7 días y tomar la decisión Go/No-Go.
