import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://revynai.es';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // No enumerar rutas de producto (/dashboard, /settings, etc.): todas
        // requieren sesión autenticada + RLS igualmente, y listarlas aquí
        // sólo le da a un atacante el mapa de la app sin necesidad de
        // reconocimiento. /api/ sí se excluye porque no aporta nada indexar.
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
