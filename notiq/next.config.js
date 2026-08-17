/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // El icono flotante de Next.js (el logo "N") que aparece en modo desarrollo:
  // en escritorio no molesta, pero en un móvil pequeño tapa botones de verdad
  // (como "Salir"). No sale nunca en producción, así que desactivarlo aquí no
  // pierde nada — solo evita que estorbe mientras se prueba en el teléfono.
  devIndicators: false,
  experimental: {
    // Por defecto 1 MB: de sobra para guardar una nota, pero no para subir un
    // PDF o una foto como adjunto (hasta 8 MB, ver app/(app)/adjuntos/actions.ts).
    serverActions: {
      bodySizeLimit: '9mb',
    },
  },
};

module.exports = nextConfig;
