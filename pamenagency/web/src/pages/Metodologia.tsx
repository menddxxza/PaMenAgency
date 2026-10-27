import { Bloque, CabeceraPestana, LlamadaFinal } from '@/components/pestanas/Bloques'
import { methodology, pipeline } from '@/content/methodology'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

const NUMEROS = ['Cero', 'Una', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez']

/**
 * Pestaña Cómo trabajamos. Aquí la numeración sí significa algo: las fases
 * van en orden y ninguna empieza hasta que la anterior ha entregado lo suyo.
 */
export default function Metodologia() {
  const total = NUMEROS[methodology.length] ?? String(methodology.length)

  useSeo({
    title: 'Cómo trabajamos',
    description:
      'Descubrir, analizar, diseñar, implementar, optimizar y escalar. Las fases con las que PaMenAgency aborda cualquier proyecto de IA, con lo que se entrega en cada una.',
    path: '/metodologia',
    jsonLd: breadcrumbJsonLd([
      { name: 'Inicio', path: '/' },
      { name: 'Cómo trabajamos', path: '/metodologia' },
    ]),
  })

  return (
    <>
      <CabeceraPestana
        antetitulo="Cómo trabajamos"
        titulo={
          <>
            {total} fases, siempre en el mismo <em>orden</em>.
          </>
        }
        entradilla="Cada una produce algo por escrito, y la siguiente no empieza hasta que eso existe. Así sabes en todo momento qué se ha hecho, qué falta y por qué."
      />

      <Bloque className="pt-block--pegado">
        <ol className="pt-timeline">
          {methodology.map((f) => (
            <li key={f.titulo} className="pt-timeline__item pm-reveal">
              <span className="pt-timeline__num" aria-hidden="true">
                {f.num}
              </span>
              <div className="pt-timeline__body">
                <h2 className="pt-timeline__title">
                  {f.titulo}
                  <span className="pt-timeline__resumen">{f.resumen}</span>
                </h2>
                <p className="pt-text">{f.texto}</p>
                <p className="pt-timeline__entrega">
                  <span>Lo que te llevas:</span> {f.entregables.join(' · ')}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Bloque>

      <Bloque className="pt-block--banda">
        <div className="pm-reveal">
          <h2 className="pt-h2">
            La IA es una etapa del recorrido, <em>no el recorrido</em>.
          </h2>
        </div>
        <ol className="pt-cadena">
          {pipeline.map((p, i) => (
            <li key={p.label} className="pm-reveal" style={{ '--reveal-delay': `${i * 90}ms` } as React.CSSProperties}>
              <span className="pt-cadena__label">{p.label}</span>
              <span className="pt-cadena__text">{p.text}</span>
            </li>
          ))}
        </ol>
      </Bloque>

      <LlamadaFinal />
    </>
  )
}
