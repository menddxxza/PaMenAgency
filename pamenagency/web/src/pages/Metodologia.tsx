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
        <ol className="pt-linea pt-linea--pegada">
          {methodology.map((f, i) => (
            <li key={f.titulo} className="pt-linea__paso pm-reveal" data-lado={i % 2 ? 'der' : 'izq'}>
              <span className="pt-linea__num" aria-hidden="true">
                {f.num}
              </span>
              <div className="pt-linea__texto">
                <p className="pt-linea__etq">
                  Fase {Number(f.num)} · {f.resumen.replace(/\.$/, '')}
                </p>
                <h2>{f.titulo}</h2>
                <p>{f.texto}</p>
                <p className="pt-linea__llevas">Lo que te llevas</p>
                <ul className="pt-linea__chips">
                  {f.entregables.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
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
