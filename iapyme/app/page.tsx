import Link from 'next/link';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import Estrellas from '@/components/Estrellas';
import FondoVideoScroll from '@/components/home/FondoVideoScroll';
import NavHome from '@/components/home/NavHome';
import PanelDetalle from '@/components/home/PanelDetalle';
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
 * panel/Admin/Salir), así que la página no se puede servir cacheada.
 *
 * En producción ya sería dinámica sola, porque leer la sesión toca cookies;
 * pero en un entorno sin Supabase configurado `getPerfilActual()` sale antes
 * de llegar a las cookies y Next la prerenderizaría como estática, dejando el
 * menú congelado en "no has iniciado sesión". Esto lo evita en ambos casos.
 */
export const dynamic = 'force-dynamic';

const SERVICIOS = ['/ AUTOMATIZACIONES', '/ AGENTES DE IA', '/ BOTS, APPS Y SAAS'];

const PASOS_COMPRA = [
  {
    indice: '01',
    titulo: 'Busca por tu problema',
    texto:
      'Entra en un sector —clínicas, finanzas, atención al cliente— o escribe en el buscador lo que quieres resolver. Si no sabes por dónde empezar, el asistente de IA traduce tu problema a una búsqueda.',
  },
  {
    indice: '02',
    titulo: 'Lee la ficha entera',
    texto:
      'Cada producto dice qué hace, qué necesitas tener antes, cuánto tarda en estar funcionando y cuánto cuesta. Sin pedir presupuesto para enterarte del precio.',
  },
  {
    indice: '03',
    titulo: 'Compara y guarda',
    texto:
      'Marca como favoritos los que te interesen y compáralos en una tabla: precio, tiempo de instalación, tipo y valoración, uno al lado del otro.',
  },
  {
    indice: '04',
    titulo: 'Contacta al vendedor',
    texto:
      'Rellenas el formulario de la ficha y le llega al momento. Te responde él directamente: IAPyme no se mete en el trato ni cobra nada por él.',
  },
];

const PASOS_VENTA = [
  {
    indice: '01',
    titulo: 'Crea tu cuenta',
    texto:
      'Con email o con Google. La misma cuenta sirve para comprar y para vender, no hay dos registros distintos.',
  },
  {
    indice: '02',
    titulo: 'Rellena la ficha',
    texto:
      'Problema que resuelves, cómo funciona, qué necesita el cliente, precio y tiempo de instalación. Hay un asistente que te va guiando campo por campo.',
  },
  {
    indice: '03',
    titulo: 'Pasa la revisión',
    texto:
      'Antes de publicarse la revisamos: que describa bien lo que ofrece y que no sea spam. Si algo no encaja te decimos el motivo para que lo corrijas y la vuelvas a enviar.',
  },
  {
    indice: '04',
    titulo: 'Recibe y responde',
    texto:
      'Cada mensaje o reseña te llega por email y queda en tu panel. Cobras tú, como prefieras: transferencia, Bizum, factura. Sin comisión.',
  },
];

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
  const sesionIniciada = Boolean(perfil);
  const esAdmin = perfil?.role === 'admin';

  return (
    <div className="relative bg-[#0a0a0a]">
      {/* El vídeo solo acompaña a la parte cinematográfica; de ahí en adelante
          la página va sobre superficie opaca para que el catálogo y el texto
          largo se lean sin pelearse con la imagen. */}
      <FondoVideoScroll idZona="zona-cine" />

      <div className="relative z-10">
        <NavHome
          sesionIniciada={sesionIniciada}
          esAdmin={Boolean(esAdmin)}
          totalSectores={categorias.length}
        />

        <main>
          <div id="zona-cine">
            {/* ---- Portada ---- */}
            <section className="flex min-h-screen flex-col justify-between px-5 pb-12 pt-24 supports-[height:100svh]:min-h-[100svh] sm:px-8 sm:pt-28 md:px-12 md:pb-16">
              <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
                <div className="flex flex-col gap-2">
                  {SERVICIOS.map((servicio, i) => (
                    <Reveal key={servicio} delay={150 + i * 120} estirar={false}>
                      <p className="font-mono text-xs uppercase tracking-[0.15em] text-white/90 drop-shadow-md">
                        {servicio}
                      </p>
                    </Reveal>
                  ))}
                </div>

                <Reveal delay={300} estirar={false}>
                  <p className="max-w-xs text-lg leading-relaxed text-white drop-shadow-md sm:text-right sm:text-xl">
                    Soluciones de IA ya construidas por otras pymes españolas. Buscas por el
                    problema que tienes, no por la tecnología que lo resuelve.
                  </p>
                </Reveal>
              </div>

              <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <div>
                  <Reveal delay={150} estirar={false}>
                    <div className="mb-5">
                      <Insignia>
                        {totalSoluciones > 0
                          ? `${totalSoluciones} ${totalSoluciones === 1 ? 'solución' : 'soluciones'} · ${categorias.length} sectores · 0 % comisión`
                          : `${categorias.length} sectores · 0 % de comisión`}
                      </Insignia>
                    </div>
                  </Reveal>

                  <Reveal delay={280} estirar={false}>
                    <Titular como="h1" className="max-w-[14ch]">
                      Soluciones de IA listas para usar.
                    </Titular>
                  </Reveal>
                </div>

                {/* Tarjeta de acción del hero. Sin persona: nada de caras ni
                    nombres que no sean reales. */}
                <Reveal delay={420} estirar={false}>
                  <div className="w-full rounded-xl border border-white/20 bg-white/15 p-4 backdrop-blur-md sm:max-w-xs">
                    <Etiqueta>Empieza por aquí</Etiqueta>
                    <p className="mt-2 text-sm leading-relaxed text-white">
                      Mira lo que ya hay publicado, o publica lo tuyo. Las dos cosas son
                      gratis.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <BotonPrincipal href="/buscar">Explorar el catálogo</BotonPrincipal>
                      <BotonSecundario
                        href="/entrar?registro=1"
                        className="border-white/50 bg-white/5"
                      >
                        Publicar
                      </BotonSecundario>
                    </div>
                  </div>
                </Reveal>
              </div>
            </section>

            {/* Hueco para que el vídeo tenga recorrido entre secciones. */}
            <div className="h-[80vh]" aria-hidden />

            {/* ---- En qué consiste ---- */}
            <section className="flex min-h-screen flex-col justify-between px-5 pb-12 pt-24 supports-[height:100svh]:min-h-[100svh] sm:px-8 sm:pt-28 md:px-12 md:pb-16">
              <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
                <Reveal delay={120} estirar={false}>
                  <Insignia>En qué consiste</Insignia>
                </Reveal>

                <Reveal delay={220} estirar={false}>
                  <p className="max-w-sm text-lg leading-relaxed text-white drop-shadow-md sm:text-right sm:text-xl">
                    No vendemos software propio ni hacemos consultoría: ponemos en contacto a
                    quien necesita una solución con quien ya la ha construido.
                  </p>
                </Reveal>
              </div>

              <div className="flex flex-1 flex-col justify-end gap-12 md:flex-row md:items-end md:justify-between md:gap-16">
                <div className="max-w-xl">
                  <Reveal delay={180} estirar={false}>
                    <Titular>Un catálogo, no una consultora.</Titular>
                  </Reveal>

                  <Reveal delay={320} estirar={false}>
                    <Parrafo className="mt-6 max-w-md text-sm sm:text-base">
                      Automatizaciones, agentes, bots, apps y SaaS que ya funcionan, con ficha
                      técnica de verdad: qué hace, qué necesitas tener, cuánto tarda en estar
                      listo y cuánto cuesta. Escrito antes de que preguntes.
                    </Parrafo>
                  </Reveal>

                  <Reveal delay={420} estirar={false}>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <BotonPrincipal href="/como-funciona">Cómo funciona</BotonPrincipal>
                      <PanelDetalle
                        etiqueta="En qué consiste"
                        titulo="Qué es IAPyme y qué no es"
                        enlace={{ href: '/como-funciona', texto: 'Ver todas las preguntas' }}
                      >
                        <p>
                          IAPyme es un catálogo de soluciones de inteligencia artificial ya
                          construidas para pymes: automatizaciones, agentes, bots, apps, webs,
                          SaaS, scripts, plantillas y servicios. Están agrupadas por sector
                          —atención al cliente, salud y clínicas, finanzas y facturación,
                          marketing, productividad, ventas, ecommerce, educación, legal y
                          recursos humanos— en vez de por la tecnología que llevan dentro.
                        </p>
                        <p>
                          <strong className="text-white">Qué no es:</strong> no es una
                          consultora, no desarrolla a medida y no vende software propio.
                          Tampoco gestiona los cobros: el pago se acuerda directamente con el
                          vendedor, fuera de la plataforma, y IAPyme no se queda ninguna parte
                          del precio.
                        </p>
                        <p>
                          <strong className="text-white">Qué aporta:</strong> el catálogo
                          ordenado, una revisión de cada ficha antes de publicarse para que
                          describa bien lo que ofrece, y el contacto directo con quien la ha
                          construido. A partir de ahí, el trato comercial es entre vosotros
                          dos.
                        </p>
                        <p>
                          <strong className="text-white">Para quién es:</strong> para una pyme
                          que tiene un problema concreto (pierde llamadas, se le acumulan las
                          facturas, no da abasto respondiendo mensajes) y quiere ver qué hay
                          hecho antes de encargar un proyecto de meses. Y para quien construye
                          estas soluciones y quiere venderlas más de una vez.
                        </p>
                        <p>
                          Si algo no encaja o el vendedor no responde, escríbenos a{' '}
                          <a
                            href="mailto:soporte.atiende@gmail.com"
                            className="text-white underline decoration-white/40 underline-offset-4"
                          >
                            soporte.atiende@gmail.com
                          </a>
                          .
                        </p>
                      </PanelDetalle>
                    </div>
                  </Reveal>
                </div>

                <Reveal delay={300} estirar={false} className="w-full md:max-w-md">
                  <PanelCristal filas={CAPACIDADES} />
                </Reveal>
              </div>
            </section>

            {/* ---- Mini tutorial ---- */}
            <section className="px-5 py-24 sm:px-8 md:px-12 md:py-32">
              <Reveal estirar={false}>
                <Insignia>Mini tutorial</Insignia>
              </Reveal>

              <Reveal delay={120} estirar={false}>
                <Titular className="mt-6 max-w-[18ch]">Cómo se usa, paso a paso.</Titular>
              </Reveal>

              <Reveal delay={220} estirar={false}>
                <Parrafo className="mt-6 max-w-lg text-sm sm:text-base">
                  Dos caminos, según a qué vengas. Ninguno tiene coste y los dos empiezan sin
                  cuenta: solo hace falta registrarse para contactar, guardar favoritos o
                  publicar.
                </Parrafo>
              </Reveal>

              <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-10">
                <Reveal delay={300} estirar={false}>
                  <div className="flex h-full flex-col">
                    <Etiqueta>Si vienes a comprar</Etiqueta>
                    <div className="mt-4 flex-1">
                      <PanelCristal filas={PASOS_COMPRA} />
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <BotonPrincipal href="/buscar">Empezar a buscar</BotonPrincipal>
                      <PanelDetalle
                        etiqueta="Tutorial · comprar"
                        titulo="Comprar en IAPyme, en detalle"
                        enlace={{ href: '/buscar', texto: 'Ir al catálogo' }}
                      >
                        <p>
                          <strong className="text-white">1. Encuentra.</strong> Puedes entrar
                          por sector desde «Sectores», usar el buscador de arriba, o pulsar
                          «¿No sabes qué buscar? Pregúntale a la IA» y describir tu problema
                          con tus palabras: el asistente lo convierte en una búsqueda del
                          catálogo. También puedes filtrar por precio, tiempo de instalación,
                          tipo de producto e idioma.
                        </p>
                        <p>
                          <strong className="text-white">2. Entiende.</strong> La ficha de
                          cada producto trae el problema que resuelve, cómo funciona, qué
                          necesitas tener (integraciones, cuentas, requisitos), el tiempo
                          estimado de instalación, el precio y su modelo (pago único,
                          suscripción...). Si el producto está en inglés, la ficha lo indica.
                        </p>
                        <p>
                          <strong className="text-white">3. Compara.</strong> Con la cuenta
                          iniciada puedes marcar favoritos con el corazón. En «Mi panel →
                          Favoritos» eliges dos o más y los ves en una tabla comparativa:
                          precio, tiempo, tipo, valoración y vendedor.
                        </p>
                        <p>
                          <strong className="text-white">4. Contacta.</strong> En la ficha
                          rellenas el formulario (nombre, email y tu mensaje; teléfono y
                          empresa son opcionales). Al vendedor le llega un aviso por email al
                          momento y te responde directamente. IAPyme no interviene en el
                          precio ni cobra comisión.
                        </p>
                        <p>
                          <strong className="text-white">5. Valora.</strong> Después puedes
                          dejar una reseña —una por producto— para que el resto sepa qué
                          esperar.
                        </p>
                        <p>
                          Si el vendedor no contesta, escríbenos a{' '}
                          <a
                            href="mailto:soporte.atiende@gmail.com"
                            className="text-white underline decoration-white/40 underline-offset-4"
                          >
                            soporte.atiende@gmail.com
                          </a>{' '}
                          con el nombre del producto y lo miramos.
                        </p>
                      </PanelDetalle>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={400} estirar={false}>
                  <div className="flex h-full flex-col">
                    <Etiqueta>Si vienes a vender</Etiqueta>
                    <div className="mt-4 flex-1">
                      <PanelCristal filas={PASOS_VENTA} />
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <BotonPrincipal href="/entrar?registro=1">Publicar gratis</BotonPrincipal>
                      <PanelDetalle
                        etiqueta="Tutorial · vender"
                        titulo="Publicar en IAPyme, en detalle"
                        enlace={{ href: '/entrar?registro=1', texto: 'Crear mi cuenta' }}
                      >
                        <p>
                          <strong className="text-white">1. Cuenta.</strong> Te registras con
                          email o con Google. No hay cuota de alta ni plan de pago: publicar
                          es gratis y no cobramos comisión sobre lo que vendas.
                        </p>
                        <p>
                          <strong className="text-white">2. Ficha.</strong> Desde «Mi panel →
                          Productos → Nuevo» rellenas la ficha. Hay un asistente que te lleva
                          por los campos: qué problema resuelve, cómo funciona, qué necesita
                          el cliente, precio y modelo de precio, tiempo de instalación,
                          integraciones e idioma. Cuanto más concreta, menos preguntas
                          tendrás que responder luego por email.
                        </p>
                        <p>
                          <strong className="text-white">3. Revisión.</strong> Al enviarla
                          pasa a revisión antes de aparecer en el catálogo. Se comprueba que
                          describa de verdad lo que ofrece y que no sea contenido engañoso o
                          spam. Si se rechaza, se te dice el motivo para que la corrijas y la
                          vuelvas a enviar. Editar una ficha ya publicada la devuelve a la
                          cola de revisión.
                        </p>
                        <p>
                          <strong className="text-white">4. Mensajes.</strong> Cuando alguien
                          pide información o deja una reseña te llega un email al momento, y
                          queda registrado en «Mi panel → Mensajes», donde puedes marcar en
                          qué estado está cada uno y exportarlos.
                        </p>
                        <p>
                          <strong className="text-white">5. Cobro.</strong> Lo acuerdas tú
                          directamente con el cliente —transferencia, Bizum, factura, lo que
                          uses—. IAPyme no gestiona pagos ni se queda ninguna parte.
                        </p>
                        <p>
                          Tu perfil público de vendedor muestra tus productos publicados; los
                          vendedores verificados llevan distintivo.
                        </p>
                      </PanelDetalle>
                    </div>
                  </div>
                </Reveal>
              </div>
            </section>

            {/* El vídeo se disuelve en negro en vez de cortarse de golpe
                cuando empieza la zona opaca. */}
            <div className="h-48 bg-gradient-to-b from-transparent to-[#0a0a0a]" aria-hidden />
          </div>

          {/* ---- A partir de aquí, superficie opaca ----
              Degradado de #0a0a0a (el negro del vídeo) al `ink` del pie, para
              que no haya dos cortes de tono visibles: ni al dejar el vídeo ni
              al entrar en el footer. */}
          <div className="bg-gradient-to-b from-[#0a0a0a] to-ink">
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
                  <div className="flex flex-wrap gap-3">
                    <BotonSecundario href="/categorias">Ver todos los sectores</BotonSecundario>
                    <PanelDetalle
                      etiqueta="Sectores"
                      titulo="Cómo está organizado el catálogo"
                      enlace={{ href: '/categorias', texto: 'Ver los sectores' }}
                    >
                      <p>
                        El catálogo se divide en diez sectores: atención al cliente, salud y
                        clínicas, finanzas y facturación, marketing, productividad, ventas,
                        ecommerce, educación, legal y recursos humanos.
                      </p>
                      <p>
                        La división es por el problema de negocio, no por la tecnología. Da
                        igual si por dentro es un agente, un bot de WhatsApp o una
                        automatización con n8n: lo que importa es si deja de perderse llamadas
                        o si las facturas dejan de hacerse a mano.
                      </p>
                      <p>
                        Dentro de cada sector puedes afinar por precio, tiempo de instalación,
                        tipo de producto e idioma. Si buscas algo y no aparece, el catálogo te
                        propone resultados cercanos de otros sectores antes de dejarte con las
                        manos vacías.
                      </p>
                      <p>
                        El número que ves junto a cada sector es cuántas soluciones hay
                        publicadas ahora mismo. Es el dato real, no una estimación.
                      </p>
                    </PanelDetalle>
                  </div>
                </Reveal>
              </div>

              <ul className="mt-12 sm:grid sm:grid-cols-2 sm:gap-x-12">
                {categorias.map((categoria, i) => (
                  <li
                    key={categoria.slug}
                    // En dos columnas, los dos primeros abren fila: ninguno
                    // lleva regla encima. Apilados en móvil, el segundo sí.
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
                  <div className="flex flex-wrap gap-3">
                    <BotonSecundario href="/buscar">Ver todo el catálogo</BotonSecundario>
                    <PanelDetalle
                      etiqueta="Destacados"
                      titulo="Qué significa que algo esté destacado"
                      enlace={{ href: '/buscar', texto: 'Ver el catálogo completo' }}
                    >
                      <p>
                        Destacado quiere decir que la ficha ha pasado la revisión y que se ha
                        marcado para enseñarla en portada. No es publicidad pagada: no se puede
                        comprar un puesto aquí.
                      </p>
                      <p>
                        Toda ficha, destacada o no, pasa antes por revisión: se comprueba que
                        describa de verdad lo que ofrece, que el precio y el tiempo de
                        instalación estén puestos, y que no sea spam ni contenido engañoso.
                      </p>
                      <p>
                        Las valoraciones que ves son reseñas reales de gente con cuenta, una
                        por producto y persona. Si un producto no tiene reseñas todavía, se
                        dice tal cual en vez de enseñar estrellas vacías.
                      </p>
                      <p>
                        Mientras el catálogo esté arrancando, los primeros vendedores salen
                        destacados aquí.
                      </p>
                    </PanelDetalle>
                  </div>
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
                    <h3 className="text-lg font-medium text-white">
                      El catálogo está empezando
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">
                      Todavía no hay soluciones publicadas. Si tienes una automatización, un
                      agente o un bot que funcione, este es el mejor momento para publicarlo:
                      los primeros vendedores salen destacados en portada.
                    </p>
                    <div className="mt-6">
                      <BotonPrincipal href="/entrar?registro=1">
                        Publicar el primero
                      </BotonPrincipal>
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
                      Publicar es gratis y no cobramos comisión. Lo que cobras por tu trabajo
                      es tuyo, entero. Tú pones el precio, tú cierras el trato y tú cobras como
                      prefieras.
                    </Parrafo>
                  </Reveal>

                  <Reveal delay={360} estirar={false}>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <BotonPrincipal href="/entrar?registro=1">
                        Publicar mi solución
                      </BotonPrincipal>
                      <PanelDetalle
                        etiqueta="Vender"
                        titulo="Lo que cuesta y lo que no"
                        enlace={{ href: '/entrar?registro=1', texto: 'Empezar a publicar' }}
                      >
                        <p>
                          <strong className="text-white">Publicar: 0 €.</strong> No hay cuota
                          de alta, ni plan mensual, ni comisión por venta. Si cobras 3.000 €
                          por instalar tu solución, recibes 3.000 €.
                        </p>
                        <p>
                          <strong className="text-white">Cómo se cobra.</strong> IAPyme no
                          procesa pagos. El cliente te escribe, acordáis el precio y él te
                          paga directamente por donde tú digas. No pasamos por en medio.
                        </p>
                        <p>
                          <strong className="text-white">Qué se te pide a cambio.</strong> Que
                          la ficha sea honesta: que el precio esté puesto, que el tiempo de
                          instalación sea realista y que lo que promete sea lo que hace. Eso
                          es lo que se revisa antes de publicar.
                        </p>
                        <p>
                          <strong className="text-white">Verificación.</strong> Un vendedor
                          verificado lleva distintivo en su perfil público. La verificación la
                          hace la administración de IAPyme; no se compra.
                        </p>
                        <p>
                          <strong className="text-white">Qué controlas.</strong> Puedes editar
                          la ficha cuando quieras (vuelve a revisión), archivarla para que deje
                          de verse, o borrar tu cuenta entera desde «Mi panel → Cuenta».
                        </p>
                      </PanelDetalle>
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

            {/* ---- Tu cuenta ---- */}
            <section className="border-t border-white/10 px-5 py-24 sm:px-8 md:px-12 md:py-32">
              <Reveal estirar={false}>
                <Etiqueta>Tu cuenta</Etiqueta>
              </Reveal>

              <Reveal delay={120} estirar={false}>
                <Titular className="mt-4 max-w-[18ch] text-3xl sm:text-5xl lg:text-6xl">
                  Mi panel, administración y salir.
                </Titular>
              </Reveal>

              <Reveal delay={220} estirar={false}>
                <Parrafo className="mt-6 max-w-lg text-sm sm:text-base">
                  {sesionIniciada
                    ? 'Tienes la sesión iniciada. Desde arriba a la derecha entras a tu panel o cierras sesión cuando quieras.'
                    : 'Con una sola cuenta compras y vendes. No hace falta para mirar el catálogo: solo para contactar, guardar favoritos o publicar.'}
                </Parrafo>
              </Reveal>

              <div className="mt-12 grid gap-4 md:grid-cols-3">
                <Reveal delay={280}>
                  <BloqueCuenta
                    titulo="Mi panel"
                    texto="Tus productos y su estado, los mensajes que recibes, tus reseñas, favoritos, perfil público y ajustes de cuenta."
                  />
                </Reveal>
                <Reveal delay={360}>
                  <BloqueCuenta
                    titulo="Admin"
                    texto="Solo para la administración de IAPyme: revisar fichas pendientes, aprobarlas o rechazarlas con motivo, y verificar vendedores."
                  />
                </Reveal>
                <Reveal delay={440}>
                  <BloqueCuenta
                    titulo="Salir"
                    texto="Cierra la sesión en este navegador. El botón está siempre arriba a la derecha, al lado de tu panel."
                  />
                </Reveal>
              </div>

              <Reveal delay={520} estirar={false}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {sesionIniciada ? (
                    <>
                      <BotonPrincipal href="/dashboard">Ir a mi panel</BotonPrincipal>
                      {esAdmin ? (
                        <BotonSecundario href="/admin">Ir a administración</BotonSecundario>
                      ) : null}
                      <form action="/auth/salir" method="post">
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-full border border-white/25
                                     bg-white/10 px-5 py-2.5 text-xs font-medium text-white
                                     backdrop-blur-md transition-colors duration-300 hover:bg-white/20
                                     focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70
                                     sm:text-sm"
                        >
                          Cerrar sesión
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <BotonPrincipal href="/entrar">Entrar</BotonPrincipal>
                      <BotonSecundario href="/entrar?registro=1">Crear cuenta</BotonSecundario>
                    </>
                  )}

                  <PanelDetalle
                    etiqueta="Tu cuenta"
                    titulo="Qué hay dentro de tu panel"
                    enlace={
                      sesionIniciada
                        ? { href: '/dashboard', texto: 'Ir a mi panel' }
                        : { href: '/entrar', texto: 'Entrar' }
                    }
                  >
                    <p>
                      <strong className="text-white">Resumen.</strong> Al entrar en «Mi panel»
                      ves de un vistazo cuántos productos tienes publicados, cuántos mensajes
                      sin leer te esperan y qué te falta por completar.
                    </p>
                    <p>
                      <strong className="text-white">Productos.</strong> Crear una ficha nueva,
                      editar las que tienes y ver su estado: borrador, en revisión, publicada,
                      rechazada (con el motivo) o archivada.
                    </p>
                    <p>
                      <strong className="text-white">Mensajes.</strong> Cada petición de
                      información que te llega, con su estado (nuevo, contactado, cerrado) para
                      que no se te pierda ninguno. Se pueden exportar.
                    </p>
                    <p>
                      <strong className="text-white">Favoritos.</strong> Los productos que has
                      guardado y la tabla para compararlos entre sí.
                    </p>
                    <p>
                      <strong className="text-white">Perfil.</strong> Tu nombre público, tu
                      descripción y tu imagen: es lo que ve quien entra en tu perfil de
                      vendedor.
                    </p>
                    <p>
                      <strong className="text-white">Cuenta.</strong> Cambiar la contraseña y,
                      si quieres, eliminar tu cuenta.
                    </p>
                    <p>
                      <strong className="text-white">Admin.</strong> Esta sección solo aparece
                      si tu cuenta es de administración. Desde ahí se revisan las fichas
                      pendientes y se verifican vendedores; no es algo que se active a
                      petición.
                    </p>
                  </PanelDetalle>
                </div>
              </Reveal>
            </section>

            {/* ---- Legal ---- */}
            <section className="border-t border-white/10 px-5 py-24 sm:px-8 md:px-12 md:py-32">
              <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
                <div>
                  <Reveal estirar={false}>
                    <Etiqueta>Legal y datos</Etiqueta>
                  </Reveal>

                  <Reveal delay={120} estirar={false}>
                    <Titular className="mt-4 max-w-[16ch] text-3xl sm:text-5xl lg:text-6xl">
                      Qué hacemos con tus datos.
                    </Titular>
                  </Reveal>

                  <Reveal delay={220} estirar={false}>
                    <Parrafo className="mt-6 max-w-md text-sm sm:text-base">
                      Resumen honesto y con enlace a las políticas completas. Para cualquier
                      duda de privacidad, el correo es{' '}
                      <a
                        href="mailto:soporte.atiende@gmail.com"
                        className="text-white underline decoration-white/40 underline-offset-4"
                      >
                        soporte.atiende@gmail.com
                      </a>
                      .
                    </Parrafo>
                  </Reveal>

                  <Reveal delay={320} estirar={false}>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <BotonSecundario href="/legal/privacidad">Privacidad</BotonSecundario>
                      <BotonSecundario href="/legal/cookies">Cookies</BotonSecundario>
                      <BotonSecundario href="/legal/terminos">Términos</BotonSecundario>
                    </div>
                  </Reveal>
                </div>

                <Reveal delay={260} estirar={false}>
                  <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-md sm:p-8">
                    <h3 className="text-lg font-medium text-white">En corto</h3>
                    <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/70">
                      <li>
                        <strong className="text-white">Qué se guarda:</strong> tu email (y
                        nombre y foto si entras con Google), la ficha de vendedor si publicas,
                        los mensajes de contacto que envías, y datos técnicos como IP y
                        navegador para evitar spam y abusos.
                      </li>
                      <li>
                        <strong className="text-white">Para qué:</strong> gestionar tu cuenta,
                        poner en contacto a comprador y vendedor, avisarte por email de lo que
                        pasa en tu cuenta, y prevenir fraude.
                      </li>
                      <li>
                        <strong className="text-white">Cookies:</strong> solo las de sesión
                        (las genera Supabase para mantenerte identificado; sin ellas no podrías
                        entrar en tu panel). La analítica, si está activa, es Plausible, que no
                        usa cookies. No hay cookies de publicidad ni de seguimiento de
                        terceros.
                      </li>
                      <li>
                        <strong className="text-white">Qué es público:</strong> si publicas, la
                        ficha y tu perfil de vendedor se ven desde fuera. Tu email no.
                      </li>
                    </ul>

                    <div className="mt-6">
                      <PanelDetalle
                        etiqueta="Legal"
                        titulo="Privacidad, cookies y términos"
                        enlace={{ href: '/legal/privacidad', texto: 'Leer la política entera' }}
                      >
                        <p>
                          Este es un resumen en lenguaje llano. Lo que vale legalmente es el
                          texto completo de cada página, y ahí está todo con su detalle.
                        </p>
                        <p>
                          <strong className="text-white">Privacidad.</strong> El responsable
                          del tratamiento es IAPyme, a través de iapymeapp.com, con contacto en
                          soporte.atiende@gmail.com. Se recogen: datos de cuenta (email; nombre y foto
                          pública si entras con Google), los datos de la ficha si publicas
                          —que son públicos a propósito—, los mensajes de contacto que envías a
                          un vendedor (nombre, email, teléfono y empresa opcionales, y el
                          mensaje), el email si te apuntaste a la lista de espera, y datos
                          técnicos como IP y navegador para seguridad. Se usan para gestionar
                          tu cuenta, poner en contacto a las dos partes, avisarte de lo que
                          ocurre en tu cuenta, prevenir abusos y cumplir obligaciones legales.
                        </p>
                        <p>
                          <strong className="text-white">Cookies.</strong> Las de sesión son
                          necesarias: las crea Supabase para mantenerte identificado mientras
                          navegas, y no se pueden desactivar sin romper el acceso a tu panel.
                          La analítica es opcional y, cuando está activa, se hace con Plausible,
                          que no usa cookies ni recoge datos identificables. No se usan cookies
                          de publicidad ni de seguimiento de terceros.
                        </p>
                        <p>
                          <strong className="text-white">Términos.</strong> Regulan el uso de
                          la plataforma y, sobre todo, lo que ya se dice en toda la página: el
                          trato comercial y el pago ocurren entre comprador y vendedor, fuera
                          de IAPyme.
                        </p>
                        <p>
                          Las tres páginas están enlazadas aquí abajo y también en el pie de
                          cualquier página del sitio.
                        </p>
                      </PanelDetalle>
                    </div>
                  </div>
                </Reveal>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
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

      <p className="mt-auto pt-4 flex items-center gap-2 text-xs text-white/55">
        <span className="truncate">{producto.categories?.nombre}</span>
        <span aria-hidden>·</span>
        <span className="shrink-0">{tiempoInstalacion(producto.minutos_instalacion)}</span>
      </p>
    </Link>
  );
}

/** Bloque de cristal de la sección "Tu cuenta". */
function BloqueCuenta({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="h-full rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-md sm:p-6">
      <h3 className="text-base font-medium text-white sm:text-lg">{titulo}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/70">{texto}</p>
    </div>
  );
}
