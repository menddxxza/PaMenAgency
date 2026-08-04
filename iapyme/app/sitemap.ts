import type { MetadataRoute } from 'next';
import { getCategorias, getProductos } from '@/lib/queries';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iapyme.es';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categorias, productos] = await Promise.all([
    getCategorias(),
    getProductos({}, 1000),
  ]);

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    {
      url: `${siteUrl}/categorias`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...categorias.map((categoria) => ({
      url: `${siteUrl}/categoria/${categoria.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
    ...productos.map((producto) => ({
      url: `${siteUrl}/p/${producto.slug}`,
      lastModified: new Date(producto.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
