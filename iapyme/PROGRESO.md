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
- [x] Todo probado de punta a punta contra una base de datos real (no solo compila:
      se ha entrado, publicado, moderado y recibido un lead de verdad).

Todo este código está en GitHub, en la rama `claude/revision-archivos-proyecto-bop2gl`
del repositorio `menddxxza/menddxxza`, dentro de la carpeta `iapyme/`.

## ⏳ En curso ahora mismo: poner el proyecto en marcha

### ✅ Ya hecho
- [x] Proyecto de Supabase creado (`IAPyme`, región Ireland).
- [x] Ejecutado el schema SQL (`0001_fase1.sql`) — tablas y categorías creadas.
- [x] Claves copiadas: Project URL y `anon public` key.
- [x] Git, Node.js y VS Code instalados.
- [x] Repositorio clonado en `C:\Users\mendo\OneDrive\Desktop\menddxxza\`.
- [x] Archivo `.env.local` creado dentro de `iapyme/` con las dos claves.

### 🔧 Ahora mismo arreglando
Se clonó el repositorio dos veces por accidente, una dentro de la otra, y `npm run
dev` se ejecutó en la carpeta equivocada (la del proyecto Atiende en vez de IAPyme).
Se está corrigiendo: subir a la carpeta correcta (`iapyme/`), borrar la carpeta
duplicada, y volver a instalar y arrancar ahí.

### ⏭️ Después de esto
1. Confirmar que `npm run dev` arranca sin errores y que `http://localhost:3000`
   muestra la home con las 10 categorías (sin el aviso de "falta configurar Supabase").
2. Registrar una cuenta en `/entrar`.
3. Convertir esa cuenta en administrador: en Supabase → **Table Editor** → tabla
   `profiles` → buscar la fila por el email → cambiar `role` de `buyer` a `admin`.
4. Publicar un producto de prueba desde `/dashboard/productos/nuevo`.
5. Aprobarlo desde `/admin` y comprobar que aparece en el catálogo público.

## 📋 Pendiente (no urgente)

- [ ] Confirmar que la subida de imágenes funciona contra el Storage real de
      Supabase (solo se ha probado contra una base de datos simulada).
- [ ] Publicar los 5 productos reales del catálogo de salida (Atiende y los otros 4).
- [ ] Comprar el dominio `iapyme.es`.
- [ ] Desplegar en Vercel con las variables de entorno configuradas.
- [ ] Invitar a los primeros vendedores externos (Fase 4 del roadmap).

## Archivos de referencia dentro de `iapyme/`

| Archivo | Para qué |
|---|---|
| `CONTEXTO-IA.md` | Resumen completo del proyecto: idea, negocio, catálogo, stack |
| `ROADMAP.md` | Las 6 fases del proyecto, con las condiciones para pasar de una a otra |
| `README.md` | Instrucciones técnicas de instalación y despliegue |
| `supabase/migrations/0001_fase1.sql` | El SQL que crea toda la base de datos |
| `.env.example` | Qué variables de entorno hacen falta y para qué sirve cada una |
