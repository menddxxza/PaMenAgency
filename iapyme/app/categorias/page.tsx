import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCategorias, getConteoPorCategoria } from '@/lib/queries';

export const revalidate = 300;

export const metadata = {
  title: 'Categorías de soluciones de IA · IAPyme',
  description:
    'Las 10 verticales de IAPyme: atención al cliente, salud, finanzas, marketing, productividad, ventas, ecommerce, educación, legal y recursos humanos.',
  alternates: { canonical: '/categorias' },
};

export default async function CategoriasPage() {
  const [categorias, conteo] = await Promise.all([getCategorias(), getConteoPorCategoria()]);

  return (
    <>
      <Header />

      <main className="container-page py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Categorías</h1>
        <p className="mt-2 max-w-2xl text-ink/65">
          Las soluciones están organizadas por sector, no por tecnología. Busca el problema
          que tienes, no la herramienta que lo resuelve.
        </p>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((categoria) => (
            <li key={categoria.slug}>
              <Link
                href={`/categoria/${categoria.slug}`}
                className="card block h-full p-6 transition hover:-translate-y-0.5 hover:border-brand-300"
              >
                <span className="text-3xl" aria-hidden>
                  {categoria.icono}
                </span>
                <h2 className="mt-4 font-bold">{categoria.nombre}</h2>
                <p className="mt-1 text-sm text-ink/65">{categoria.descripcion}</p>
                <p className="mt-4 text-sm font-semibold text-brand-600">
                  {conteo[categoria.id]
                    ? `${conteo[categoria.id]} ${conteo[categoria.id] === 1 ? 'solución' : 'soluciones'} →`
                    : 'Sé el primero →'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <Footer />
    </>
  );
}
