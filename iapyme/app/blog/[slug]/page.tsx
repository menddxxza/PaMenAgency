import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icono from '@/components/Icono';
import { POSTS_BLOG, getPostBlog } from '@/lib/blog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iapyme.es';

export function generateStaticParams() {
  return POSTS_BLOG.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPostBlog(params.slug);
  if (!post) return { title: 'Artículo no encontrado · IAPyme' };

  return {
    title: `${post.titulo} · IAPyme`,
    description: post.resumen,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.titulo, description: post.resumen, type: 'article' },
  };
}

export default function PostBlogPage({ params }: { params: { slug: string } }) {
  const post = getPostBlog(params.slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.titulo,
    description: post.resumen,
    datePublished: post.fecha,
    author: { '@type': 'Organization', name: 'IAPyme' },
    publisher: { '@type': 'Organization', name: 'IAPyme' },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  const otros = POSTS_BLOG.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <Header />

      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container-page py-12 sm:py-16">
        <nav aria-label="Migas" className="text-sm text-ink/65">
          <Link href="/blog" className="hover:text-ink">
            Blog
          </Link>{' '}
          › <span className="text-ink">{post.categoria}</span>
        </nav>

        <article className="mx-auto mt-6 max-w-2xl">
          <p className="eyebrow text-brand-700">{post.categoria}</p>
          <h1 className="mt-3 text-display-s font-medium tracking-tight text-ink">
            {post.titulo}
          </h1>
          <p className="dato mt-4 text-xs text-ink/65">
            {new Date(post.fecha).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          <div className="regla mt-8" />

          <div className="mt-8 space-y-6">
            {post.contenido.map((bloque, i) => {
              if (bloque.tipo === 'h2') {
                return (
                  <h2
                    key={i}
                    className="!mt-10 font-display text-xl font-normal text-ink"
                  >
                    {bloque.texto}
                  </h2>
                );
              }
              if (bloque.tipo === 'ul') {
                return (
                  <ul key={i} className="list-disc space-y-2 pl-5 leading-relaxed text-ink/80">
                    {bloque.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="leading-relaxed text-ink/80">
                  {bloque.texto}
                </p>
              );
            })}
          </div>

          <div className="mt-12 rounded-2xl border border-ink/10 bg-brand-50/40 p-6">
            <p className="font-display text-lg font-normal text-ink">
              ¿Buscas una solución de verdad, no otro artículo?
            </p>
            <p className="mt-1.5 text-sm text-ink/65">
              Mira el catálogo completo o pregúntale al buscador con IA qué encaja con tu
              negocio.
            </p>
            <Link
              href="/buscar"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Ver el catálogo
              <Icono nombre="flecha" className="h-4 w-4" />
            </Link>
          </div>
        </article>

        {otros.length > 0 ? (
          <div className="mx-auto mt-16 max-w-2xl border-t border-ink/10 pt-10">
            <p className="eyebrow">Sigue leyendo</p>
            <ul className="mt-4 space-y-4">
              {otros.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group flex items-baseline gap-3 focus:outline-none
                               focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <span className="font-display text-base font-normal text-ink transition-colors duration-fast ease-out group-hover:text-brand-700">
                      {p.titulo}
                    </span>
                    <Icono
                      nombre="flecha"
                      className="h-3.5 w-3.5 shrink-0 text-ink/30 transition-transform duration-fast ease-out group-hover:translate-x-1"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </main>

      <Footer />
    </>
  );
}
