import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iapyme.es';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Páginas privadas o sin valor de indexación: no aportan nada al buscador
      // y desperdician presupuesto de rastreo.
      disallow: ['/dashboard', '/admin', '/api', '/entrar'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
