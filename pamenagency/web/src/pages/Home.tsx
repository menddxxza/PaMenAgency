import { Link, useNavigate } from 'react-router-dom'
import { Antetitulo, Bloque, EnlaceFlecha, LlamadaFinal, escalon } from '@/components/pestanas/Bloques'
import { organizationJsonLd, useSeo } from '@/lib/seo'
import { useRevealRoot } from '@/lib/motion'
import { faqs } from '@/content/faq'
import { site } from '@/content/site'
import { services } from '@/content/services'
import { founder } from '@/content/founder'
import { perfilGoogle, resenas } from '@/content/resenas'
import { DiagnosticTool } from '@/components/sections/DiagnosticTool'
import FlowingMenu, { type FlowingMenuItem } from '@/components/reactbits/FlowingMenu'
import { EntradaHerramienta, FacturaLeyendose } from '@/components/sections/HerramientaPiezas'
import { facturas } from '@/content/herramientas'
import { SimboloServicio } from '@/components/three/SimboloServicio'

/** Tres compromisos de la portada. */
const GARANTIAS = ['Diagnóstico gratis de 30 minutos', 'Precio de partida claro', 'Revisión humana donde hace falta']

/** Los cuatro servicios por los que suele empezar quien llega a la web. */
const DESTACADOS = ['automatizacion-de-procesos', 'procesamiento-de-documentos', 'asistente-de-ia-empresarial', 'integracion-de-sistemas']

/** Las preguntas que se ven en la portada (y que van en los datos estructurados). */
const PREGUNTAS = faqs.slice(0, 4)

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Pestaña Inicio: qué hacemos, en poco texto y centrado. El detalle está en
 * cada pestaña (servicios, herramientas, nosotros) y en las páginas del pie.
 */
export default function Home() {
  useSeo({
    title: 'Inteligencia artificial y automatización para empresas',
    description: site.description,
    path: '/',
    jsonLd: [
      organizationJsonLd,
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: PREGUNTAS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a.join(' ') },
        })),
      },
      { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url, inLanguage: 'es-ES' },
    ],
  })

  const heroRef = useRevealRoot<HTMLElement>()
  const navigate = useNavigate()
  const abrirServicio = (item: FlowingMenuItem, _i: number, e: React.MouseEvent<HTMLElement>) => {
    if (!item.link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(item.link)
  }
  const destacados = DESTACADOS.map((slug) => services.find((s) => s.slug === slug)).filter(
    (s): s is (typeof services)[number] => Boolean(s),
  )

  return (
    <>
      <section className="pt-hero pt-hero--centro pt-hero--simple" ref={heroRef}>
        <div className="pm-container">
          <div className="pt-hero__text">
            <div className="pm-reveal">
              <Antetitulo>Agencia de inteligencia artificial</Antetitulo>
            </div>
            <h1 className="pt-hero__title pm-reveal" style={escalon(1, 90)}>
              Inteligencia artificial y automatización <em>para tu empresa</em>.
            </h1>
            <p className="pt-hero__lead pm-reveal" style={escalon(2, 90)}>
              Automatizamos las tareas que se repiten en tu negocio.
            </p>
            <div className="pt-actions pm-reveal" style={escalon(3, 90)}>
              <Link className="pt-btn pt-btn--gold" to="/contacto">
                Pedir diagnóstico gratis <span aria-hidden="true">→</span>
              </Link>
              <Link className="pt-btn pt-btn--line" to="/servicios">
                Ver servicios
              </Link>
            </div>
            <ul className="pt-garantias pm-reveal" style={escalon(4, 90)}>
              {GARANTIAS.map((g) => (
                <li key={g}>
                  <Check />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Herramientas de pago: lo que se puede usar hoy mismo. */}
      <Bloque className="pt-block--herr">
        <article className="pt-herr-tarjeta pt-herr-tarjeta--inicio pm-reveal">
          <div className="pt-herr-tarjeta__texto">
            <span className="pt-herr-chip">
              <span className="pt-herr-chip__punto" aria-hidden="true" /> Nuevo · Herramientas
            </span>
            <h2 className="pt-h2">
              Lee tus facturas con IA. <em>Hoy mismo.</em>
            </h2>
            <p className="pt-text">Desde {Math.min(...facturas.planes.map((p) => p.precio))} € al mes, sin permanencia.</p>
            <EntradaHerramienta ruta={facturas.ruta} compacto />
            <p className="pt-herr-prueba">
              {facturas.prueba}{' '}
              <Link to="/herramientas" className="pt-herr-enlace">
                Ver todas las herramientas →
              </Link>
            </p>
          </div>
          <FacturaLeyendose />
        </article>
      </Bloque>

      <Bloque>
        <div className="pt-centrado pm-reveal">
          <Antetitulo>Servicios</Antetitulo>
          <h2 className="pt-h2">
            Se empieza por <em>uno</em>.
          </h2>
        </div>
        <div className="pt-panel pm-reveal" style={escalon(1, 120)}>
          <div className="pt-flowing pt-flowing--inicio pt-flowing--simbolos">
            <FlowingMenu
              items={destacados.map((s) => ({
                text: s.name,
                link: `/servicios/${s.slug}`,
                marquee: s.name,
                meta: s.priceFrom,
                icon: <SimboloServicio slug={s.slug} variante="fila" />,
              }))}
              speed={90}
              stretch={0.6}
              magnet={0.35}
              followCursor={0.85}
              direction="alternate"
              duration={0.6}
              bandInset={14}
              bandRadius={80}
              carryContent
              showArrow
              align="left"
              textColor="#EFE4CF"
              bgColor="transparent"
              marqueeBgColor="#C9A063"
              marqueeTextColor="#2A0B0C"
              borderColor="rgba(232, 203, 148, 0.18)"
              ariaLabel="Servicios destacados"
              onItemClick={abrirServicio}
            />
          </div>
        </div>
        <div className="pt-centro pm-reveal">
          <EnlaceFlecha to="/servicios">Ver los {services.length} servicios</EnlaceFlecha>
        </div>
      </Bloque>

      <Bloque id="diagnostico" className="pt-block--banda">
        <div className="pt-centrado pm-reveal">
          <Antetitulo>Diagnóstico gratuito</Antetitulo>
          <h2 className="pt-h2">
            ¿Cuánto puede ayudarte la IA <em>a ti</em>?
          </h2>
          <p className="pt-text">Diez preguntas, dos minutos. No se guarda nada.</p>
        </div>
        <div className="pt-diagnostico pm-reveal" style={escalon(1, 120)}>
          <DiagnosticTool />
        </div>
      </Bloque>

      <Bloque>
        <div className="pt-centrado pm-reveal">
          <img className="pt-persona-mini" src={founder.recorte} alt={`${founder.nombre}, ${founder.cargo}`}
            width={900} height={1200} loading="lazy" decoding="async" />
          <Antetitulo>Quién hay detrás</Antetitulo>
          <h2 className="pt-h2">{founder.nombre}</h2>
          <p className="pt-text">Fundador. Ayudo a pymes y autónomos a ahorrar tiempo con IA.</p>
          <EnlaceFlecha to="/nosotros">Conocer la agencia</EnlaceFlecha>
        </div>
      </Bloque>

      <Bloque id="resenas" className="pt-block--banda">
        <div className="pt-centrado pm-reveal">
          <Antetitulo>Reseñas en Google</Antetitulo>
          <p className="pt-resenas__nota pt-resenas__nota--centro" aria-label={`${perfilGoogle.media} de 5 estrellas en ${perfilGoogle.total} reseñas de Google`}>
            <span className="pt-resenas__media">{perfilGoogle.media}</span>
            <span className="pt-estrellas" aria-hidden="true">★★★★★</span>
            <span>{perfilGoogle.total} reseñas</span>
          </p>
        </div>
        <ul className="pt-resenas">
          {resenas.slice(0, 3).map((r, i) => (
            <li key={r.autor} className="pt-resena pm-reveal" style={escalon(i, 90)}>
              <span className="pt-estrellas" role="img" aria-label={`${r.estrellas} de 5 estrellas`}>
                {'★'.repeat(r.estrellas)}
              </span>
              <blockquote>«{r.texto}»</blockquote>
              <p className="pt-resena__autor">{r.autor}</p>
            </li>
          ))}
        </ul>
        <div className="pt-centro pm-reveal">
          <a className="pt-arrowlink" href={perfilGoogle.url} target="_blank" rel="noopener noreferrer">
            <span>Ver todas en Google</span>
            <span className="pt-arrowlink__arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </Bloque>

      <Bloque estrecho>
        <div className="pt-centrado pm-reveal">
          <Antetitulo>Preguntas frecuentes</Antetitulo>
        </div>
        <div className="pt-faq-simple pm-reveal">
          {PREGUNTAS.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              {f.a.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </details>
          ))}
        </div>
        <div className="pt-centro pm-reveal">
          <EnlaceFlecha to="/faq">Más preguntas</EnlaceFlecha>
        </div>
      </Bloque>

      <LlamadaFinal />
    </>
  )
}
