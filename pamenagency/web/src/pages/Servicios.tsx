import { useNavigate } from 'react-router-dom'
import { Bloque, CabeceraPestana, LlamadaFinal } from '@/components/pestanas/Bloques'
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
      'Consultoría de IA, automatización, integración, asistentes, formación y estrategia. Servicios de inteligencia artificial para personas, PYMEs y empresas.',
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
        entradilla="Diez formas de trabajar la Inteligencia Artificial, desde entender qué te conviene hasta dejarlo funcionando y documentado. Casi nadie necesita las diez: se empieza por una."
      />

      <Bloque className="pt-block--pegado">
        <div className="pt-flowing pm-reveal">
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
        <p className="pt-nota">
          Entra en cada servicio para ver qué incluye, para quién tiene sentido, cómo se trabaja y
          cuándo no merece la pena.
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
