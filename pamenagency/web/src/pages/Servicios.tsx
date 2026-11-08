import { useNavigate } from 'react-router-dom'
import { Antetitulo, Bloque, CabeceraPestana, LlamadaFinal, escalon } from '@/components/pestanas/Bloques'
import { mantenimientoNoIncluye, planesMantenimiento } from '@/content/mantenimiento'
import FlowingMenu, { type FlowingMenuItem } from '@/components/reactbits/FlowingMenu'
import { services } from '@/content/services'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'
import { site } from '@/content/site'

/** Los diez servicios como filas del menú: nombre, precio de partida y enlace. */
const FILAS: FlowingMenuItem[] = services.map((s) => ({
  text: s.name,
  link: `/servicios/${s.slug}`,
  marquee: s.name,
  meta: s.priceFrom,
}))

/**
 * Pestaña Servicios: los diez en un menú con franja deslizante (React Bits ·
 * FlowingMenu). Al pasar por una fila, una franja dorada se desliza hasta ella
 * con el nombre en movimiento; cada fila lleva a la página del servicio.
 */
export default function Servicios() {
  const navigate = useNavigate()

  // Los enlaces del componente son <a href> normales: se interceptan para
  // cambiar de pestaña sin recargar, salvo si se abre en una pestaña nueva.
  const abrir = (item: FlowingMenuItem, _i: number, e: React.MouseEvent<HTMLElement>) => {
    if (!item.link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(item.link)
  }

  useSeo({
    title: 'Servicios',
    description:
      'Automatización de procesos, procesamiento inteligente de documentos, asistentes de IA e integración de sistemas para empresas, con precio de partida sin IVA y mantenimiento mensual.',
    path: '/servicios',
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Servicios', path: '/servicios' },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Servicios de PaMenAgency',
        itemListElement: services.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: s.name,
          description: s.short,
          url: `${site.url}/servicios/${s.slug}`,
        })),
      },
    ],
  })

  return (
    <>
      <CabeceraPestana
        antetitulo="Servicios"
        titulo={
          <>
            En qué podemos <em>ayudarte</em>.
          </>
        }
        entradilla="Cuatro servicios para empresas y dos complementarios. Cada uno tiene un alcance definido y un precio de partida sin IVA; el presupuesto final depende de tu caso y te lo damos por escrito antes de empezar."
      />

      <Bloque className="pt-block--pegado">
        <div className="pt-panel pm-reveal">
          <div className="pt-flowing" style={{ '--filas': FILAS.length } as React.CSSProperties}>
          <FlowingMenu
            items={FILAS}
            speed={90}
            stretch={0.6}
            magnet={0.35}
            followCursor={0.85}
            direction="alternate"
            duration={0.6}
            bandInset={17}
            bandRadius={80}
            carryContent
            showArrow
            align="left"
            textColor="#EFE4CF"
            bgColor="transparent"
            marqueeBgColor="#C9A063"
            marqueeTextColor="#2A0B0C"
            borderColor="rgba(232, 203, 148, 0.18)"
            ariaLabel="Servicios"
            onItemClick={abrir}
          />
        </div>
        </div>
        <p className="pt-nota">
          Entra en cada servicio para ver qué incluye, para quién tiene sentido, cómo se trabaja y
          cuándo no merece la pena. Precios sin IVA.
        </p>
      </Bloque>

      <Bloque id="mantenimiento" className="pt-block--banda">
        <div className="pm-reveal">
          <Antetitulo>Después de la entrega</Antetitulo>
          <h2 className="pt-h2">
            Mantenimiento <em>mensual</em>.
          </h2>
          <p className="pt-text">
            Una automatización necesita que alguien la vigile: las herramientas cambian, las APIs se
            actualizan y los datos no siempre llegan como se esperaba. Tres planes, con un alcance
            fijado por contrato. Nunca soporte ilimitado ni disponibilidad 24 horas.
          </p>
        </div>
        <ul className="pt-planes">
          {planesMantenimiento.map((plan, i) => (
            <li key={plan.nombre} className="pt-plan pm-reveal" style={escalon(i, 90)}>
              <h3 className="pt-plan__nombre">{plan.nombre}</h3>
              <p className="pt-plan__precio">
                {plan.precio}
                <span> al mes</span>
              </p>
              <p className="pt-plan__resumen">{plan.resumen}</p>
              <ul className="pt-plan__lista">
                {plan.incluye.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="pt-nota pm-reveal">
          Precios sin IVA. Ningún plan incluye {mantenimientoNoIncluye.length} cosas, que se presupuestan
          aparte cuando hacen falta: {mantenimientoNoIncluye.join(' ')}
        </p>
      </Bloque>

      <LlamadaFinal
        titulo={
          <>
            ¿No sabes cuál te <em>toca</em>?
          </>
        }
        texto="Es lo más habitual. Cuéntanos tu situación y te decimos por dónde empezaríamos nosotros."
      />
    </>
  )
}
