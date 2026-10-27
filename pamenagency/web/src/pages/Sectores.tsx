import { Link } from 'react-router-dom'
import { Bloque, CabeceraPestana, LlamadaFinal, escalon } from '@/components/pestanas/Bloques'
import { useCases } from '@/content/useCases'
import { site } from '@/content/site'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

/** Pestaña Sectores: la situación típica de cada negocio y dónde aporta la IA. */
export default function Sectores() {
  useSeo({
    title: 'IA por sector',
    description:
      'Cómo se aplica la Inteligencia Artificial en cada sector: hostelería, clínicas, comercio, autónomos, agencias, inmobiliarias, servicios, educación y más. Ejemplos de aplicación, no casos de clientes.',
    path: '/sectores',
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Sectores', path: '/sectores' },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: useCases.map((u, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: u.sector,
          url: `${site.url}/sectores/${u.slug}`,
        })),
      },
    ],
  })

  return (
    <>
      <CabeceraPestana
        antetitulo="Sectores"
        titulo={
          <>
            La IA no se aplica igual en todos los <em>negocios</em>.
          </>
        }
        entradilla="Lo que ahorra tiempo en una clínica no es lo mismo que lo que lo ahorra en un taller. Estos son los puntos donde solemos encontrar algo aprovechable en cada sector."
      />

      <Bloque className="pt-block--pegado">
        <ul className="pt-sectores">
          {useCases.map((u, i) => (
            <li key={u.slug} className="pm-reveal" style={escalon(i % 3, 90)}>
              <Link to={`/sectores/${u.slug}`} className="pt-sector">
                <h2 className="pt-sector__name">{u.sector}</h2>
                <p className="pt-sector__text">{u.situacion}</p>
                <span className="pt-sector__more">
                  {u.mejoras.length} puntos de mejora <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="pt-nota pm-reveal">
          Son ejemplos de aplicación, no proyectos realizados: no atribuimos ningún trabajo a
          ninguna empresa concreta. Si tu sector no está aquí, el método es el mismo.
        </p>
      </Bloque>

      <LlamadaFinal
        titulo={
          <>
            ¿Y en tu caso <em>concreto</em>?
          </>
        }
        texto="Un sector es una generalización. La auditoría mira tu empresa, no tu categoría."
        principal={{ label: 'Pedir auditoría de IA', to: '/auditoria-ia' }}
        secundaria={{ label: 'Cuéntanos tu caso', to: '/contacto' }}
      />
    </>
  )
}
