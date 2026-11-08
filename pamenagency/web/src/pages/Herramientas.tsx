import { Antetitulo, Bloque, CabeceraPestana, LlamadaFinal, escalon } from '@/components/pestanas/Bloques'
import { herramientas, proximamente, type Herramienta } from '@/content/herramientas'
import { site } from '@/content/site'
import { Check, EntradaHerramienta, Ilustracion } from '@/components/sections/HerramientaPiezas'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

/** Pestaña Herramientas: las aplicaciones de pago que se usan dentro de la web. */
export default function Herramientas() {
  useSeo({
    title: 'Herramientas de IA',
    description:
      'Herramientas de PaMenAgency listas para usar: el lector de facturas con IA, el asistente que responde con los documentos de tu empresa y el gestor de incidencias para tus clientes. Pruébalas gratis.',
    path: '/herramientas',
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Herramientas', path: '/herramientas' },
      ]),
      ...herramientas.map((h) => ({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: `${h.nombre} · ${site.name}`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: `${site.url}${h.ruta}`,
        offers: h.planes.map((p) => ({
          '@type': 'Offer',
          name: p.nombre,
          price: String(p.precio),
          priceCurrency: 'EUR',
          description: p.ventajas.join(' · '),
        })),
      })),
    ],
  })

  return (
    <>
      <CabeceraPestana
        antetitulo="Herramientas"
        titulo={
          <>
            IA lista para usar, <em>hoy</em>.
          </>
        }
        entradilla="Desde el navegador, sin instalar nada. Pruebas gratis y pagas solo si te sirve."
      />

      {herramientas.map((h) => <BloqueHerramienta key={h.slug} h={h} />)}

      {proximamente.length > 0 && (
      <Bloque>
          <div className="pt-centrado pm-reveal">
            <Antetitulo>Próximamente</Antetitulo>
            <h2 className="pt-h2">
              Vienen <em>más</em>.
            </h2>
          </div>
          <div className="pt-herr-pronto-lista">
            {proximamente.map((h, i) => (
              <article key={h.nombre} className="pt-herr-pronto-item pm-reveal" style={escalon(i + 1, 90)}>
                <span className="pt-herr-chip pt-herr-chip--tenue">Próximamente</span>
                <h3>{h.nombre}</h3>
                <p>{h.texto}</p>
              </article>
            ))}
          </div>
        </Bloque>
      )}

      <LlamadaFinal
        titulo={
          <>
            ¿Necesitas algo <em>a medida</em>?
          </>
        }
        texto="Lo automatizamos para tu empresa. El diagnóstico es gratis."
        principal={{ label: 'Cuéntanos tu caso', to: '/contacto' }}
        secundaria={{ label: 'Ver servicios', to: '/servicios' }}
      />
    </>
  )
}


/** La tarjeta de una herramienta y, debajo, sus planes. */
function BloqueHerramienta({ h }: { h: Herramienta }) {
  return (
    <>
      <Bloque id={h.slug}>
        <article className="pt-herr-tarjeta pm-reveal">
          <div className="pt-herr-tarjeta__texto">
            <span className="pt-herr-chip">
              <span className="pt-herr-chip__punto" aria-hidden="true" /> Nuevo
            </span>
            <h2 className="pt-h2">{h.nombre}</h2>
            <p className="pt-herr-frase">{h.frase}</p>
            <p className="pt-text">{h.descripcion}</p>
            <ul className="pt-herr-puntos">
              {h.puntos.map((p) => (
                <li key={p}>
                  <Check />
                  {p}
                </li>
              ))}
            </ul>
            <EntradaHerramienta ruta={h.ruta} />
            <p className="pt-herr-prueba">{h.prueba}</p>
          </div>
          <Ilustracion slug={h.slug} />
        </article>
      </Bloque>

      <Bloque id={`planes-${h.slug}`}>
        <div className="pt-centrado pm-reveal">
          <Antetitulo>{h.planesTitulo}</Antetitulo>
          <h2 className="pt-h2">
            {h.planesLema[0]}
            <em>{h.planesLema[1]}</em>
            {h.planesLema[2]}
          </h2>
          <p className="pt-text">
            Sin permanencia. Al mes, sin IVA.
          </p>
        </div>
        <div className="pt-herr-planes">
          {h.planes.map((p, i) => (
            <article
              key={p.nombre}
              className={`pt-herr-plan pm-reveal${p.destacado ? ' pt-herr-plan--destacado' : ''}`}
              style={escalon(i + 1, 90)}
            >
              {p.destacado && <span className="pt-herr-plan__etiqueta">El más elegido</span>}
              <h3>{p.nombre}</h3>
              <p className="pt-herr-plan__precio">
                <b>{p.precio} €</b>
                <span>/mes</span>
              </p>
              <ul>
                {p.ventajas.map((v) => (
                  <li key={v}>
                    <Check />
                    {v}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="pt-herr-planes__pie pm-reveal">
          <EntradaHerramienta ruta={h.ruta} />
          <p className="pt-herr-prueba">
            {h.prueba}
          </p>
        </div>
      </Bloque>
    </>
  )
}
