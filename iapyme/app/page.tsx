import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Buscador from '@/components/Buscador';
import ProductoCard from '@/components/ProductoCard';
import Icono from '@/components/Icono';
import EstadoVacio from '@/components/ui/EstadoVacio';
import { FAMILIAS } from '@/lib/tipos-publicacion';
import { getCategorias, getConteoPorCategoria, getProductos } from '@/lib/queries';
import type { ProductoConRelaciones } from '@/lib/database.types';

export const metadata = {
  title: 'IAPyme · El marketplace de la IA aplicada',
  description:
    'Descubre soluciones de IA, servicios, negocios, profesionales, trabajos y proyectos. Publicar es gratis y el trato es directo entre las dos partes.',
  alternates: { canonical: '/' },
};

export const revalidate = 120;

export default async function Home() {
  const [categorias, conteo, recientes, masVistos, mejorValorados] = await Promise.all([
    getCategorias(),
    getConteoPorCategoria(),
    getProductos({ orden: 'recientes' }, 8),
    getProductos({ orden: 'vistos' }, 4),
    getProductos({ orden: 'valorados' }, 4),
  ]);

  const hayCatalogo = recientes.length > 0;
  const conValoracion = mejorValorados.filter((p) => p.rating_total > 0);

  return (
    <>
      <Header />

      <main>
        {/* ---- Entrada: qué es esto y a qué has venido ---- */}
        <section className="border-b border-superficie-200 bg-superficie-0">
          {/* Entrada corta a propósito: en un marketplace lo que convierte es
              el catálogo, así que el titular cede sitio para que el feed
              empiece cuanto antes. */}
          <div className="container-page py-9 sm:py-12">
            <h1 className="max-w-[24ch] font-display text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-4xl">
              Descubre lo que necesitas.{' '}
              <span className="text-ink/45">Publica lo que sabes hacer.</span>
            </h1>

            <p className="mt-3 max-w-[54ch] leading-relaxed text-ink/65">
              El marketplace de la IA aplicada: soluciones ya construidas, servicios,
              profesionales y negocios. Sin comisión, y el trato lo cerráis vosotros.
            </p>

            <div className="mt-6 max-w-2xl">
              <Buscador />
            </div>

            <ul className="mt-5 flex flex-wrap gap-2">
              {FAMILIAS.map((familia) => (
                <li key={familia.slug}>
                  <Link
                    href={`/explorar/${familia.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-superficie-200
                               bg-superficie-0 px-3 py-1.5 text-sm text-ink/75 transition-colors
                               duration-fast ease-out hover:border-superficie-300 hover:bg-superficie-100
                               hover:text-ink focus:outline-none focus-visible:ring-2
                               focus-visible:ring-brand-500"
                  >
                    <Icono nombre={familia.icono} className="h-4 w-4 text-ink/45" />
                    {familia.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {hayCatalogo ? (
          <>
            {masVistos.length > 0 ? (
              <Tira
                titulo="Lo que más se está mirando"
                pie="Ordenado por visitas reales de la última semana, no por quién paga más."
                enlace={{ href: '/buscar?orden=vistos', texto: 'Ver más' }}
                publicaciones={masVistos}
              />
            ) : null}

            <Tira
              titulo="Recién publicado"
              enlace={{ href: '/buscar', texto: 'Ver todo el catálogo' }}
              publicaciones={recientes}
            />

            {conValoracion.length > 0 ? (
              <Tira
                titulo="Mejor valorado"
                pie="Nota media de las reseñas de gente que lo ha contratado."
                enlace={{ href: '/buscar?orden=valorados', texto: 'Ver más' }}
                publicaciones={conValoracion}
              />
            ) : null}
          </>
        ) : (
          <section className="container-page py-14">
            <EstadoVacio
              icono={<Icono nombre="explorar" className="h-8 w-8" />}
              titulo="El marketplace está arrancando"
              texto="Todavía no hay nada publicado. Si tienes una solución, un servicio o un negocio de IA, ahora mismo eres el primero en la portada."
              accion={{ href: '/publicar', texto: 'Publicar el primero' }}
            />
          </section>
        )}

        {/* ---- Sectores ---- */}
        <section className="border-t border-superficie-200 py-12 sm:py-16">
          <div className="container-page">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                Por sector
              </h2>
              <Link
                href="/explorar"
                className="text-sm font-medium text-brand-700 transition-colors duration-fast
                           ease-out hover:text-brand-800 focus:outline-none focus-visible:rounded-sm
                           focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Explorar todo
              </Link>
            </div>

            <p className="mt-2 max-w-[52ch] text-sm text-ink/60">
              Una clínica no busca un agente conversacional: busca dejar de perder llamadas.
            </p>

            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categorias.map((categoria) => (
                <li key={categoria.slug}>
                  <Link
                    href={`/categoria/${categoria.slug}`}
                    className="flex h-full flex-col gap-2 rounded-xl border border-superficie-200
                               bg-superficie-0 p-4 transition-colors duration-fast ease-out
                               hover:border-superficie-300 hover:bg-superficie-50
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <span aria-hidden className="text-xl">
                      {categoria.icono}
                    </span>
                    <span className="text-sm font-medium leading-snug text-ink">
                      {categoria.nombre}
                    </span>
                    {conteo[categoria.id] ? (
                      <span className="dato mt-auto text-xs text-ink/50">
                        {conteo[categoria.id]}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---- Publicar ---- */}
        <section className="border-t border-superficie-200 bg-superficie-0 py-12 sm:py-16">
          <div className="container-page grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-16">
            <div>
              <h2 className="max-w-[18ch] font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Súbelo una vez. Véndelo mil.
              </h2>
              <p className="mt-4 max-w-[50ch] leading-relaxed text-ink/65">
                Publicar es gratis y no cobramos comisión. Tú pones el precio, tú cierras el
                trato y tú cobras como prefieras.
              </p>
              <Link href="/publicar" className="btn-primary mt-6">
                Publicar
                <Icono nombre="flecha" className="h-4 w-4" />
              </Link>
            </div>

            <dl className="grid gap-px overflow-hidden rounded-xl border border-superficie-200 bg-superficie-200 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { dato: '0 €', texto: 'por publicar y por vender' },
                { dato: `${categorias.length}`, texto: 'sectores donde encajar tu ficha' },
                { dato: 'Revisada', texto: 'cada publicación, antes de salir' },
              ].map((fila) => (
                <div key={fila.texto} className="bg-superficie-0 px-4 py-3.5">
                  <dt className="dato text-lg font-semibold text-ink">{fila.dato}</dt>
                  <dd className="text-sm text-ink/60">{fila.texto}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

/**
 * Tira horizontal del feed. Todas las secciones de descubrimiento usan esta
 * misma forma para que la portada se lea como una sola lista larga y no como
 * bloques inconexos, cada uno con su estilo.
 */
function Tira({
  titulo,
  pie,
  enlace,
  publicaciones,
}: {
  titulo: string;
  pie?: string;
  enlace: { href: string; texto: string };
  publicaciones: ProductoConRelaciones[];
}) {
  return (
    <section className="border-t border-superficie-200 py-10 sm:py-12">
      <div className="container-page">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {titulo}
          </h2>
          <Link
            href={enlace.href}
            className="text-sm font-medium text-brand-700 transition-colors duration-fast ease-out
                       hover:text-brand-800 focus:outline-none focus-visible:rounded-sm
                       focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {enlace.texto}
          </Link>
        </div>

        {pie ? <p className="mt-2 max-w-[56ch] text-sm text-ink/60">{pie}</p> : null}

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {publicaciones.map((publicacion) => (
            <li key={publicacion.id}>
              <ProductoCard producto={publicacion} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
