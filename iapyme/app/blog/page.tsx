import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { POSTS_BLOG } from '@/lib/blog';

export const metadata = {
  title: 'Blog · IAPyme',
  description:
    'Guías prácticas para elegir, comprar e instalar soluciones de IA en tu pyme, sin jerga técnica.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  const posts = [...POSTS_BLOG].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  return (
    <>
      <Header />

      <main className="container-page py-12 sm:py-16">
        <div className="max-w-2xl">
          <p className="eyebrow">Blog</p>
          <h1 className="mt-3 text-display-s font-medium tracking-tight text-ink">
            Guías para comprar con criterio
          </h1>
          <p className="mt-4 leading-relaxed text-ink/70">
            Nada de jerga ni de humo: cómo elegir, comparar e instalar soluciones de IA en tu
            negocio, escrito para quien no tiene por qué saber de tecnología.
          </p>
        </div>

        <ul className="mt-14 divide-y divide-ink/10 border-t border-ink/10">
          {posts.map((post, i) => (
            <li key={post.slug}>
              <Reveal delay={Math.min(i, 4) * 60}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col gap-2 py-8 focus:outline-none
                             focus-visible:ring-2 focus-visible:ring-brand-500 sm:flex-row
                             sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <div className="min-w-0 sm:max-w-xl">
                    <p className="eyebrow text-brand-700">{post.categoria}</p>
                    <h2 className="mt-2 font-display text-xl font-normal leading-snug text-ink transition-colors duration-fast ease-out group-hover:text-brand-700">
                      {post.titulo}
                    </h2>
                    <p className="mt-2 leading-relaxed text-ink/65">{post.resumen}</p>
                  </div>
                  <p className="dato shrink-0 text-xs text-ink/65">
                    {new Date(post.fecha).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </main>

      <Footer />
    </>
  );
}
