# Base de datos

## Cómo aplicarlo en Supabase

En el SQL Editor del proyecto, en este orden:

1. `migrations/0001_fase1.sql` — catálogo, fichas y leads (Fase 1).
2. `waitlist.sql` — lista de espera de la landing de validación (Fase 0), si aún se usa.

## Probar los cambios antes de tocar el proyecto real

Las políticas RLS son fáciles de escribir mal y difíciles de verificar a ojo, así que hay
una batería de pruebas que se ejecuta contra un Postgres local. `tests/shim_supabase.sql`
simula lo que aporta Supabase (`auth.users`, `auth.uid()`, `storage`) para que la
migración corra tal cual, sin modificarla.

```bash
createdb iapyme
psql -d iapyme -f supabase/tests/shim_supabase.sql
psql -d iapyme -f supabase/migrations/0001_fase1.sql
psql -d iapyme -f supabase/tests/rls_fase1.sql
```

Todos los checks deben devolver `ok = t`. Cuatro de ellos comprueban que algo falle: si el
bloqueo no salta, la prueba lanza un error con el texto `FALLO`.

## Qué protege el schema

**La moderación no se puede saltar.** RLS por sí sola no basta: el vendedor tiene permiso
legítimo para editar su propia fila, así que podría poner `status = 'published'` con un
`UPDATE` y saltarse la cola de revisión entera. Lo que hay que acotar es *qué columnas*
puede tocar, y eso lo hacen los triggers `products_enforce_insert` y
`products_enforce_moderation`:

- Solo un administrador puede publicar, rechazar o destacar una ficha.
- Una ficha nueva nace siempre en `draft` o `pending_review`, sin destacar y con los
  contadores a cero — aunque el cliente mande otra cosa.
- Editar el contenido de una ficha ya publicada la devuelve a `pending_review`. Sin esto se
  podría publicar algo inocuo y luego editarlo para colar otra cosa.

**`is_admin()` es `security definer`** a propósito: si la política de `products` consultara
`profiles` directamente, la propia RLS de `profiles` se evaluaría dentro de la política y
entraría en recursión.

## Tablas

| Tabla | Para qué |
|---|---|
| `profiles` | Usuarios. Se crea sola al registrarse (trigger sobre `auth.users`) |
| `categories` | Las 10 verticales, con seed incluido |
| `products` | El catálogo. Estados: `draft → pending_review → published / rejected` |
| `leads` | Lo que sustituye al pago en la Fase 1: alguien pregunta por un producto |
| `product_views` | Visitas por ficha, para la conversión del panel de vendedor |

`orders`, `reviews` y `seller_subscriptions` llegan en la Fase 2, con los pagos. No se
adelantan.
