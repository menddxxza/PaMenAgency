import type { MetadataRoute } from 'next';
import { getCategorias, getProductos } from '@/lib/queries';
import { POSTS_BLOG } from '@/lib/blog';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iapyme.es';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categorias, productos] = await Promise.all([
    getCategorias(),
    getProductos({}, 1000),
  ]);

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    {
      url: `${siteUrl}/como-funciona`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    ...POSTS_BLOG.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.fecha),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
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
