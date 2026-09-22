import Link from 'next/link';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import Estrellas from '@/components/Estrellas';
import NavHome from '@/components/home/NavHome';
import { ParallaxHero } from '@/components/ui/parallax-scrolling';
import {
  BotonPrincipal,
  BotonSecundario,
  Etiqueta,
  Insignia,
  PanelCristal,
  Parrafo,
  Titular,
} from '@/components/home/piezas';
import { getCategorias, getConteoPorCategoria, getDestacados } from '@/lib/queries';
import { getPerfilActual } from '@/lib/supabase/server';
import { precioResumido, tiempoInstalacion } from '@/lib/formato';
import type { ProductoConRelaciones } from '@/lib/database.types';

export const metadata = {
  title: 'IAPyme · Soluciones de IA listas para usar',
  description:
    'Catálogo de automatizaciones, agentes y bots ya construidos para pymes españolas. Publicar es gratis y sin comisión: el trato es directo entre comprador y vendedor.',
  alternates: { canonical: '/' },
};

/**
 * La cabecera cambia según haya sesión o no (Entrar/Publicar frente a Mi
 * panel/Admin/Salir), así que la página no se puede servir cacheada. Sin
 * Supabase configurado `getPerfilActual()` sale antes de tocar cookies y Next
 * la prerenderizaría estática, con el menú congelado en "no has entrado".
 */
export const dynamic = 'force-dynamic';

const CAPACIDADES = [
  {
    indice: '01',
    titulo: 'Ordenado por problema',
    texto:
      'El catálogo se agrupa por sector y por lo que resuelve, no por la tecnología que lleva dentro. Una clínica no busca un agente conversacional: busca dejar de perder llamadas.',
  },
  {
    indice: '02',
    titulo: 'Trato directo',
    texto:
      'Contactas con quien ha construido la solución, no con un comercial. Él te responde, él te la instala y con él acuerdas el precio.',
  },
  {
    indice: '03',
    titulo: 'Cero comisión',
    texto:
      'Publicar es gratis y no nos quedamos ninguna parte de lo que cobres. El pago se acuerda fuera de la plataforma, entre vosotros dos.',
  },
];

export default async function Home() {
  const [categorias, conteo, destacados, perfil] = await Promise.all([
    getCategorias(),
    getConteoPorCategoria(),
    getDestacados(6),
    getPerfilActual(),
  ]);

  // Cifras reales del catálogo: si están a cero, no se enseñan inventadas.
  const totalSoluciones = Object.values(conteo).reduce((suma, n) => suma + n, 0);

  return (
    <div className="bg-[#0a0a0a]">
      <NavHome
        sesionIniciada={Boolean(perfil)}
        esAdmin={perfil?.role === 'admin'}
        totalSectores={categorias.length}
      />

      <main>
        <ParallaxHero titulo={<>Soluciones de IA listas para usar.</>}>
          <p className="max-w-md text-base leading-relaxed text-white/80 drop-shadow-md sm:text-lg">
            Automatizaciones, agentes y bots ya construidos por otras pymes españolas.
            Buscas por el problema que tienes, no por la tecnología que lo resuelve.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <BotonPrincipal href="/buscar">Explorar el catálogo</BotonPrincipal>
            <BotonSecundario href="/entrar?registro=1" className="border-white/45">
              Publicar gratis
            </BotonSecundario>
          </div>

          <Insignia>
            {totalSoluciones > 0
              ? `${totalSoluciones} ${totalSoluciones === 1 ? 'solución' : 'soluciones'} · ${categorias.length} sectores · 0 % comisión`
              : `${categorias.length} sectores · 0 % de comisión`}
          </Insignia>
        </ParallaxHero>

        {/* ---- En qué consiste ---- */}
        <section className="px-5 py-24 sm:px-8 md:px-12 md:py-32">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div className="max-w-xl">
              <Reveal estirar={false}>
                <Insignia>En qué consiste</Insignia>
              </Reveal>

              <Reveal delay={140} estirar={false}>
                <Titular className="mt-6">Un catálogo, no una consultora.</Titular>
              </Reveal>

              <Reveal delay={260} estirar={false}>
                <Parrafo className="mt-6 max-w-md text-sm sm:text-base">
                  No vendemos software propio ni hacemos consultoría: ponemos en contacto a
                  quien necesita una solución con quien ya la ha construido. Cada ficha dice
                  qué hace, qué necesitas tener, cuánto tarda en estar lista y cuánto cuesta.
                </Parrafo>
              </Reveal>

              <Reveal delay={360} estirar={false}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <BotonPrincipal href="/como-funciona">Cómo funciona</BotonPrincipal>
                  <BotonSecundario href="/categorias">Ver los sectores</BotonSecundario>
                </div>
              </Reveal>
            </div>

            <Reveal delay={300} estirar={false} className="w-full lg:max-w-md">
              <PanelCristal filas={CAPACIDADES} />
            </Reveal>
          </div>
        </section>

        {/* ---- Explora por sector ---- */}
        <section className="border-t border-white/10 px-5 py-24 sm:px-8 md:px-12 md:py-32">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <Reveal estirar={false}>
              <div>
                <Etiqueta>Explora por sector</Etiqueta>
                <Titular className="mt-4 max-w-[16ch] text-3xl sm:text-5xl lg:text-6xl">
                  Por el problema, no por la tecnología.
                </Titular>
              </div>
            </Reveal>

            <Reveal delay={120} estirar={false}>
              <BotonSecundario href="/categorias">Ver todos los sectores</BotonSecundario>
            </Reveal>
          </div>

          <ul className="mt-12 sm:grid sm:grid-cols-2 sm:gap-x-12">
            {categorias.map((categoria, i) => (
              <li
                key={categoria.slug}
                // En dos columnas los dos primeros abren fila: sin regla
                // encima. Apilados en móvil, el segundo sí la lleva.
                className={
                  i === 0
                    ? ''
                    : i === 1
                      ? 'border-t border-white/10 sm:border-t-0'
                      : 'border-t border-white/10'
                }
              >
                <Reveal delay={Math.min(i, 6) * 40} estirar={false}>
                  <Link
                    href={`/categoria/${categoria.slug}`}
                    className="group flex items-baseline gap-5 py-6 focus:outline-none
                               focus-visible:relative focus-visible:z-10 focus-visible:rounded-sm
                               focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    <span aria-hidden className="shrink-0 font-mono text-sm text-white/45">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2.5">
                        <span className="text-lg" aria-hidden>
                          {categoria.icono}
                        </span>
                        <h3 className="text-lg font-medium leading-snug tracking-tight text-white transition-colors duration-300 group-hover:text-white/70">
                          {categoria.nombre}
                        </h3>
                      </span>
                      <p className="mt-1.5 max-w-[42ch] text-sm leading-relaxed text-white/60">
                        {categoria.descripcion}
                      </p>
                      {conteo[categoria.id] ? (
                        <p className="mt-2 font-mono text-[11px] tracking-[0.15em] text-white/45">
                          {conteo[categoria.id]}{' '}
                          {conteo[categoria.id] === 1 ? 'SOLUCIÓN' : 'SOLUCIONES'}
                        </p>
                      ) : null}
                    </span>

                    <span
                      aria-hidden
                      className="shrink-0 self-center text-white/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white"
                    >
                      →
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* ---- Destacados ---- */}
        <section className="border-t border-white/10 px-5 py-24 sm:px-8 md:px-12 md:py-32">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <Reveal estirar={false}>
              <div>
                <Etiqueta>Destacados</Etiqueta>
                <Titular className="mt-4 max-w-[16ch] text-3xl sm:text-5xl lg:text-6xl">
                  Lo que ya está publicado.
                </Titular>
              </div>
            </Reveal>

            <Reveal delay={120} estirar={false}>
              <BotonSecundario href="/buscar">Ver todo el catálogo</BotonSecundario>
            </Reveal>
          </div>

          {destacados.length > 0 ? (
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {destacados.map((producto, i) => (
                <Reveal key={producto.id} delay={Math.min(i, 5) * 70}>
                  <TarjetaOscura producto={producto} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal delay={200} estirar={false}>
              <div className="mt-12 max-w-xl rounded-2xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-md sm:p-8">
                <h3 className="text-lg font-medium text-white">El catálogo está empezando</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  Todavía no hay soluciones publicadas. Si tienes una automatización, un
                  agente o un bot que funcione, este es el mejor momento para publicarlo: los
                  primeros vendedores salen destacados en portada.
                </p>
                <div className="mt-6">
                  <BotonPrincipal href="/entrar?registro=1">Publicar el primero</BotonPrincipal>
                </div>
              </div>
            </Reveal>
          )}
        </section>

        {/* ---- Vender ---- */}
        <section className="border-t border-white/10 px-5 py-24 sm:px-8 md:px-12 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
            <div>
              <Reveal estirar={false}>
                <Insignia>Para quien vende</Insignia>
              </Reveal>

              <Reveal delay={140} estirar={false}>
                <Titular className="mt-6 max-w-[16ch]">Súbelo una vez. Véndelo mil.</Titular>
              </Reveal>

              <Reveal delay={260} estirar={false}>
                <Parrafo className="mt-6 max-w-md text-sm sm:text-base">
                  Publicar es gratis y no cobramos comisión. Lo que cobras por tu trabajo es
                  tuyo, entero. Tú pones el precio, tú cierras el trato y tú cobras como
                  prefieras.
                </Parrafo>
              </Reveal>

              <Reveal delay={360} estirar={false}>
                <div className="mt-8">
                  <BotonPrincipal href="/entrar?registro=1">Publicar mi solución</BotonPrincipal>
                </div>
              </Reveal>
            </div>

            <Reveal delay={300} estirar={false}>
              <PanelCristal
                filas={[
                  {
                    indice: '€',
                    titulo: 'Sin comisión',
                    texto: 'Ni por publicar ni por vender. No hay letra pequeña aquí.',
                  },
                  {
                    indice: '↺',
                    titulo: 'Una ficha, muchas ventas',
                    texto:
                      'Lo que ya has construido para un cliente lo puedes vender otra vez sin rehacerlo.',
                  },
                  {
                    indice: '✓',
                    titulo: 'Revisado antes de salir',
                    texto:
                      'Cada ficha pasa revisión, así que el catálogo no se llena de humo y el tuyo se lee al lado de cosas serias.',
                  },
                ]}
              />
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/** Tarjeta de producto en versión oscura, para la portada sobre fondo negro. */
function TarjetaOscura({ producto }: { producto: ProductoConRelaciones }) {
  const precio = precioResumido(producto);

  return (
    <Link
      href={`/p/${producto.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-white/15 bg-white/[0.06] p-5
                 backdrop-blur-md transition-colors duration-300 hover:border-white/30
                 hover:bg-white/[0.1] focus:outline-none focus-visible:ring-2
                 focus-visible:ring-white/70"
    >
      <div className="flex items-center justify-between gap-3">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-base"
        >
          {producto.categories?.icono ?? '·'}
        </span>
        <span className="shrink-0 font-mono text-sm font-medium text-white">
          {precio.principal}
        </span>
      </div>

      <h3 className="mt-4 text-base font-medium leading-snug text-white transition-colors duration-300 group-hover:text-white/80">
        {producto.titulo}
      </h3>

      {producto.rating_total > 0 ? (
        <p className="mt-2 flex items-center gap-2">
          <Estrellas puntuacion={producto.rating_promedio} tamano="text-[0.7rem]" />
          <span className="text-xs text-white/50">({producto.rating_total})</span>
        </p>
      ) : null}

      <p className="mt-auto flex items-center gap-2 pt-4 text-xs text-white/55">
        <span className="truncate">{producto.categories?.nombre}</span>
        <span aria-hidden>·</span>
        <span className="shrink-0">{tiempoInstalacion(producto.minutos_instalacion)}</span>
      </p>
    </Link>
  );
}
