/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Por defecto 1 MB: de sobra para guardar una nota, pero no para subir un
    // PDF o una foto como adjunto (hasta 8 MB, ver app/(app)/adjuntos/actions.ts).
    serverActions: {
      bodySizeLimit: '9mb',
    },
  },
};

module.exports = nextConfig;
