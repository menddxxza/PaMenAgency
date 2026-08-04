# IAPyme — Progreso

Última actualización: 31 de julio de 2026.

## ✅ Hecho

### Planificación
- [x] Idea, problema y modelo de negocio definidos (ver `CONTEXTO-IA.md`).
- [x] Plan de fases completo, sin cobrar comisión hasta tener volumen (ver `ROADMAP.md`).
- [x] Mockup visual de la app completa (12 pantallas, 4 roles).

### Código (Fase 0 — landing de validación)
- [x] Landing en Next.js con captación de emails segmentada (comprador/vendedor).
- [x] Desplegable sin Supabase configurado.

### Código (Fase 1 — MVP sin pagos)
- [x] Schema de Supabase completo: `profiles`, `categories`, `products`, `leads`,
      `product_views`, con RLS, triggers y las 10 categorías precargadas.
      Archivo: `supabase/migrations/0001_fase1.sql`.
- [x] Autenticación (email + Google) con `@supabase/ssr`.
- [x] Catálogo público: home, categorías, buscador con filtros, ficha de producto,
      perfil de vendedor.
- [x] Panel de vendedor: resumen con métricas, asistente de publicación en 4 pasos,
      subida de imágenes, bandeja de mensajes (leads).
- [x] Cola de moderación en `/admin`: aprobar, pedir cambios con motivo, destacar.
- [x] Todo probado de punta a punta contra una base de datos real.

Todo este código está en GitHub, en la rama `claude/revision-archivos-proyecto-bop2gl`
del repositorio `menddxxza/menddxxza`, dentro de la carpeta `iapyme/`.

### 🚀 Puesto en marcha de verdad (esto es nuevo)

- [x] Proyecto de Supabase creado (`IAPyme`, región Ireland) y schema ejecutado.
- [x] Entorno local funcionando en Windows con VS Code (`npm run dev` en `localhost:3000`).
- [x] Cuenta registrada y convertida en administrador.
- [x] Producto de prueba (**Atiende**) publicado, aprobado y visible en el catálogo público.
- [x] Probado el flujo completo de un comprador: ficha pública → "Pedir información" →
      el mensaje llega a la bandeja de "Mensajes" del vendedor.
- [x] **Desplegado en Netlify**: [https://iapyme.netlify.app](https://iapyme.netlify.app)
      (rama `claude/revision-archivos-proyecto-bop2gl`, con el plugin oficial de Next.js).
- [x] Login con **Google** configurado y funcionando (Google Cloud + Supabase Auth).
- [x] Dominio **`iapyme.es`** comprado (pendiente de que termine de procesarse).

## ⏳ Pendiente

- [ ] Conectar `iapyme.es` a Netlify en cuanto el dominio termine de procesarse.
- [ ] Confirmar que la subida de imágenes funciona contra el Storage real de Supabase
      con una imagen de verdad (de momento solo se ha probado sin imagen).
- [ ] Publicar los otros 4 productos del catálogo de salida: Agente de Citas Dental,
      Bot de Facturación, Asistente de Contenido, Resumidor de Reuniones.
- [ ] Invitar a los primeros vendedores externos (Fase 4 del roadmap).
- [ ] Publicar el post de validación / empezar a compartir la web.

## Notas técnicas para no repetir errores ya resueltos

- **Las variables `NEXT_PUBLIC_*` se leen al arrancar `npm run dev` / al compilar.**
  Si cambias `.env.local`, hay que reiniciar el servidor.
- **El archivo tiene que llamarse exactamente `.env.local`** (no una carpeta, no
  `.env.local.txt`), directamente dentro de `iapyme/`, al mismo nivel que `package.json`.
- **En Netlify hace falta `netlify.toml`** con el plugin `@netlify/plugin-nextjs` — sin
  él, Netlify sirve `.next` como archivos estáticos sueltos y todo da 404. Ya está
  añadido al repo.
- **Login con Google en producción**: en Supabase → Authentication → URL Configuration,
  la "Site URL" y las "Redirect URLs" tienen que incluir el dominio real
  (`https://iapyme.netlify.app/**`), si no Google devuelve a `localhost` y falla.
- **El repositorio de IAPyme vive dentro de `menddxxza/menddxxza`**, en la subcarpeta
  `iapyme/` — no lo clones aparte ni lo confundas con la raíz del repo (que es el
  proyecto Atiende, con Vite en vez de Next.js).

## Archivos de referencia dentro de `iapyme/`

| Archivo | Para qué |
|---|---|
| `CONTEXTO-IA.md` | Resumen completo del proyecto: idea, negocio, catálogo, stack |
| `ROADMAP.md` | Las 6 fases del proyecto, con las condiciones para pasar de una a otra |
| `README.md` | Instrucciones técnicas de instalación y despliegue |
| `supabase/migrations/0001_fase1.sql` | El SQL que crea toda la base de datos |
| `netlify.toml` | Configuración de despliegue en Netlify |
| `.env.example` | Qué variables de entorno hacen falta y para qué sirve cada una |
