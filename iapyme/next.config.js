/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Antes vivían en netlify.toml; puestas aquí funcionan igual en
  // cualquier proveedor de hosting, Netlify incluido.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
