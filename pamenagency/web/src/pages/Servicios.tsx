import { Link } from 'react-router-dom'
import { Bloque, CabeceraPestana, LlamadaFinal, escalon } from '@/components/pestanas/Bloques'
import { services } from '@/content/services'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'
import { site } from '@/content/site'

/** Pestaña Servicios: los diez, en una lista que se lee de un vistazo. */
export default function Servicios() {
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
        <ul className="pt-servicios">
          {services.map((s, i) => (
            <li key={s.slug} className="pm-reveal" style={escalon(i % 4)}>
              <Link to={`/servicios/${s.slug}`} className="pt-servicio">
                <h2 className="pt-servicio__name">{s.name}</h2>
                <p className="pt-servicio__text">{s.short}</p>
                <p className="pt-servicio__benefit">{s.benefit}</p>
                <span className="pt-servicio__meta">
                  <span>{s.priceFrom}</span>
                  <span className="pt-servicio__more">
                    Ver el servicio <span aria-hidden="true">→</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
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
