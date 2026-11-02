import { Link, useNavigate } from 'react-router-dom'
import { Antetitulo, Bloque, EnlaceFlecha, LlamadaFinal, escalon } from '@/components/pestanas/Bloques'
import { TarjetaPM } from '@/components/pestanas/TarjetaPM'
import { organizationJsonLd, useSeo } from '@/lib/seo'
import { useRevealRoot } from '@/lib/motion'
import { faqs } from '@/content/faq'
import { site } from '@/content/site'
import { services } from '@/content/services'
import { methodology } from '@/content/methodology'
import { useCases } from '@/content/useCases'
import { founder } from '@/content/founder'
import { perfilGoogle, resenas } from '@/content/resenas'
import { FACTOR } from '@/content/workday'
import { WorkdayCompare } from '@/components/sections/WorkdayCompare'
import { DiagnosticTool } from '@/components/sections/DiagnosticTool'
import TextLoop from '@/components/reactbits/TextLoop'
import FlowingMenu, { type FlowingMenuItem } from '@/components/reactbits/FlowingMenu'

/** La cinta de la portada: los servicios por los que suele empezar quien llega. */
const SEP = ' · '
const CINTA = ['Automatización', 'Documentos', 'Asistentes', 'Integración'].join(` ${SEP} `)

/** El lema del fundador con la última palabra en oro ("No vendemos *humo*."). */
function LemaConOro({ lema }: { lema: string }) {
  const sinPunto = lema.replace(/\.$/, '')
  const corte = sinPunto.lastIndexOf(' ')
  return (
    <>
      {sinPunto.slice(0, corte + 1)}
      <em>{sinPunto.slice(corte + 1)}</em>.
    </>
  )
}

/** Los cuatro servicios por los que suele empezar quien llega a la web. */
const DESTACADOS = ['automatizacion-de-procesos', 'procesamiento-de-documentos', 'asistente-de-ia-empresarial', 'integracion-de-sistemas']

/**
 * Pestaña Inicio: qué hacemos en una pantalla, y una muestra de cada una
 * de las otras pestañas para que se sepa qué hay detrás del menú.
 */
export default function Home() {
  useSeo({
    title: 'Inicio',
    description: site.description,
    path: '/',
    jsonLd: [
      organizationJsonLd,
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.slice(0, 8).map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a.join(' ') },
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: site.name,
        url: site.url,
        inLanguage: 'es-ES',
      },
    ],
  })

  const heroRef = useRevealRoot<HTMLElement>()
  const navigate = useNavigate()

  // Las filas del menú son <a href> normales: se cambia de pestaña sin
  // recargar, salvo si se abre en una pestaña nueva (Ctrl/Cmd + clic).
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
      <section className="pt-hero" ref={heroRef}>
        <div className="pm-container pt-hero__grid">
          <div className="pt-hero__text">
            <div className="pm-reveal">
              <Antetitulo>Inteligencia artificial y automatización para empresas</Antetitulo>
            </div>
            <h1 className="pt-hero__title pm-reveal" style={escalon(1, 90)}>
              La tecnología debe trabajar para tu empresa. <em>No al revés.</em>
            </h1>
            <p className="pt-hero__lead pm-reveal" style={escalon(2, 90)}>
              Identificamos oportunidades, diseñamos soluciones e implementamos inteligencia
              artificial y automatización en procesos empresariales. Si en tu caso no aporta nada,
              te lo decimos antes de cobrar.
            </p>
            <div className="pt-actions pm-reveal" style={escalon(3, 90)}>
              <Link className="pt-btn pt-btn--gold" to="/contacto">
                Solicitar una valoración de mi empresa <span aria-hidden="true">→</span>
              </Link>
              <Link className="pt-btn pt-btn--line" to="/servicios">
                Ver servicios
              </Link>
            </div>
            <Link to="/nosotros" className="pt-firma pm-reveal" style={escalon(4, 90)}>
              <img src={founder.foto} alt="" width={800} height={1067} />
              <span>
                <strong>{founder.lema}</strong>
                <span>
                  {founder.nombre} · {founder.cargo}
                </span>
              </span>
            </Link>
          </div>

          <div className="pt-hero__visual pm-reveal" style={escalon(2, 120)}>
            <TarjetaPM />
          </div>
        </div>
      </section>

      <Bloque>
        <div className="pt-split">
          <div className="pm-reveal">
            <Antetitulo>Servicios</Antetitulo>
            <h2 className="pt-h2">
              Se empieza por <em>uno</em>.
            </h2>
            <p className="pt-text">
              Cuatro servicios para empresas, cada uno con un alcance y un precio de partida claros.
              Casi siempre se empieza por automatizar un solo proceso.
            </p>
            <EnlaceFlecha to="/servicios">Ver los {services.length} servicios</EnlaceFlecha>
          </div>

          {/* Los cuatro destacados con franja dorada deslizante (React Bits · FlowingMenu). */}
          <div className="pt-flowing pt-flowing--inicio pm-reveal" style={escalon(1, 120)}>
            <FlowingMenu
              items={destacados.map((s) => ({
                text: s.name,
                link: `/servicios/${s.slug}`,
                marquee: s.name,
                meta: s.priceFrom,
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
      </Bloque>

      {/* Cinta burdeos en movimiento entre bloques (React Bits · TextLoop).
          Se puede arrastrar; con movimiento reducido se queda quieta. */}
      <div className="pt-cinta" aria-label="Servicios de PaMenAgency" role="region">
        <TextLoop
          text={CINTA}
          shape="wave"
          speed={85}
          direction="forward"
          separator={SEP}
          curviness={28}
          tilt={-3}
          fontSize={46}
          fontWeight={600}
          letterSpacing={2}
          uppercase
          ribbon
          ribbonColor="#6d0a1b"
          ribbonWidth={86}
          color="#E8CB94"
          edgeFade={0}
          draggable
          pauseOnHover={false}
        />
      </div>

      <Bloque id="jornada">
        <div className="pt-split pt-split--centro">
          <div className="pm-reveal">
            <Antetitulo>Una jornada, dos formas de trabajar</Antetitulo>
            <h2 className="pt-h2">
              Hasta <em>x{FACTOR} más rápido</em> en las tareas que se repiten.
            </h2>
            <p className="pt-text">
              Las mismas seis tareas, la misma jornada. A mano da tiempo a una. Con IA, a las seis
              — y la tarde queda libre para lo que de verdad necesita a una persona.
            </p>
            <div className="pt-actions">
              <Link className="pt-btn pt-btn--gold" to="/auditoria-ia">
                Ver qué puedo automatizar <span aria-hidden="true">→</span>
              </Link>
              <Link className="pt-btn pt-btn--line" to="/calculadora">
                Calcular lo que me cuesta hoy
              </Link>
            </div>
          </div>
          <div className="pm-reveal" style={escalon(1, 120)}>
            <WorkdayCompare />
            <p className="pt-nota pt-nota--centro">
              Simulación ilustrativa con tareas repetitivas habituales. El resultado real depende de
              cada proceso.
            </p>
          </div>
        </div>
      </Bloque>

      <Bloque className="pt-block--banda">
        <div className="pm-reveal">
          <Antetitulo>Cómo trabajamos</Antetitulo>
          <h2 className="pt-h2">
            Siempre en el mismo <em>orden</em>.
          </h2>
        </div>
        <ol className="pt-fases" aria-label="Fases de trabajo">
          {methodology.map((f, i) => (
            <li key={f.titulo} className="pm-reveal" style={escalon(i, 80)}>
              <span className="pt-fases__nombre">{f.titulo}</span>
              <span className="pt-fases__resumen">{f.resumen}</span>
            </li>
          ))}
        </ol>
        <div className="pm-reveal">
          <EnlaceFlecha to="/metodologia">Qué entregamos en cada fase</EnlaceFlecha>
        </div>
      </Bloque>

      <Bloque>
        <div className="pm-reveal">
          <Antetitulo>Sectores</Antetitulo>
          <h2 className="pt-h2">
            La IA no se aplica igual en todos los <em>negocios</em>.
          </h2>
        </div>
        <ul className="pt-chips">
          {useCases.map((u, i) => (
            <li key={u.slug} className="pm-reveal" style={escalon(i, 50)}>
              <Link to={`/sectores/${u.slug}`} className="pt-chip">
                {u.sector}
              </Link>
            </li>
          ))}
        </ul>
        <div className="pm-reveal">
          <EnlaceFlecha to="/sectores">Ver dónde aporta en cada uno</EnlaceFlecha>
        </div>
      </Bloque>

      <Bloque id="diagnostico" className="pt-block--banda">
        <div className="pt-centrado pm-reveal">
          <Antetitulo>Diagnóstico gratuito</Antetitulo>
          <h2 className="pt-h2">
            ¿Cuánto potencial de IA tiene tu <em>negocio</em>?
          </h2>
          <p className="pt-text">
            Diez preguntas, dos minutos. Se calcula en tu propio navegador: no se envía ni se guarda
            ninguna respuesta.
          </p>
        </div>
        <div className="pt-diagnostico pm-reveal" style={escalon(1, 120)}>
          <DiagnosticTool />
        </div>
      </Bloque>

      <Bloque>
        <div className="pt-persona">
          <figure className="pt-persona__foto pm-reveal">
            <img
              src={founder.recorte}
              alt={`${founder.nombre}, ${founder.cargo}`}
              width={900}
              height={1200}
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div className="pm-reveal" style={escalon(1, 120)}>
            <Antetitulo>Quién hay detrás</Antetitulo>
            <h2 className="pt-h2">
              <LemaConOro lema={founder.lema} />
            </h2>
            <p className="pt-text">
              Soy {founder.nombre}. Ayudo a pymes, autónomos y empresas a descubrir dónde la
              inteligencia artificial les ahorra tiempo o dinero de verdad, y a implantarla sin
              complicarles la vida. Si la IA no te va a aportar nada, te lo digo antes de cobrarte
              un euro.
            </p>
            <EnlaceFlecha to="/nosotros">Conocer la agencia</EnlaceFlecha>
          </div>
        </div>
      </Bloque>

      <Bloque id="resenas" className="pt-block--banda">
        <div className="pt-resenas__cabecera pm-reveal">
          <div>
            <Antetitulo>Reseñas en Google</Antetitulo>
            <h2 className="pt-h2">
              Lo que dicen quienes ya han <em>trabajado</em> con nosotros.
            </h2>
          </div>
          <p className="pt-resenas__nota" aria-label={`${perfilGoogle.media} de 5 estrellas en ${perfilGoogle.total} reseñas de Google`}>
            <span className="pt-resenas__media">{perfilGoogle.media}</span>
            <span className="pt-estrellas" aria-hidden="true">★★★★★</span>
            <span>{perfilGoogle.total} reseñas en Google</span>
          </p>
        </div>
        <ul className="pt-resenas">
          {resenas.map((r, i) => (
            <li key={r.autor} className="pt-resena pm-reveal" style={escalon(i, 90)}>
              <span className="pt-estrellas" role="img" aria-label={`${r.estrellas} de 5 estrellas`}>
                {'★'.repeat(r.estrellas)}
              </span>
              <blockquote>«{r.texto}»</blockquote>
              <p className="pt-resena__autor">{r.autor}</p>
            </li>
          ))}
        </ul>
        <div className="pm-reveal">
          <a className="pt-arrowlink" href={perfilGoogle.url} target="_blank" rel="noopener noreferrer">
            <span>Ver todas las reseñas en Google</span>
            <span className="pt-arrowlink__arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </Bloque>

      <LlamadaFinal />
    </>
  )
}
