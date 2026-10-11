# Logotipo original de PaMenAgency

No se encontró el logotipo original ni en este repositorio ni en una web accesible
desde el entorno de producción (pamenagency.com no resolvía desde el contenedor).
Para no inventar ni deformar la marca, el vídeo usa una **marca tipográfica**
(«PAMENAGENCY» en Manrope SemiBold dorado) en lugar de un logotipo.

Para usar el logotipo original:

1. Guarda aquí el archivo como `logo.png` (PNG con transparencia, ≥ 800 px de ancho,
   preferiblemente la versión clara/dorada para fondo negro).
2. Vuelve a renderizar (ver `../../README.md`). La escena de cierre lo detecta
   automáticamente y lo coloca centrado sobre la marca tipográfica.

Si el logotipo ya incluye el nombre, conviene ocultar la marca tipográfica:
en `src/scene.js`, función `endCard`, cambia la llamada a `wordmark(...)` para
que sólo se dibuje cuando `LOGO` sea `null`.
