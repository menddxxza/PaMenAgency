import { Antetitulo, Bloque, CabeceraPestana, LlamadaFinal, escalon } from '@/components/pestanas/Bloques'
import { facturas, proximamente } from '@/content/herramientas'
import { site } from '@/content/site'
import { Check, EntradaHerramienta, FacturaLeyendose } from '@/components/sections/HerramientaPiezas'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

/** Pestaña Herramientas: las aplicaciones de pago que se usan dentro de la web. */
export default function Herramientas() {
  useSeo({
    title: 'Herramientas de IA',
    description:
      'Herramientas de PaMenAgency listas para usar: el lector de facturas con IA lee tus facturas y albaranes, comprueba que cuadran y los deja listos para tu gestoría. Prueba gratis 20 facturas.',
    path: '/herramientas',
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Herramientas', path: '/herramientas' },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: `${facturas.nombre} · ${site.name}`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: `${site.url}${facturas.ruta}`,
        offers: facturas.planes.map((p) => ({
          '@type': 'Offer',
          name: p.nombre,
          price: String(p.precio),
          priceCurrency: 'EUR',
          description: p.ventajas.join(' · '),
        })),
      },
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
        entradilla="Aplicaciones de PaMenAgency que funcionan desde el navegador, sin instalar nada ni esperar a un proyecto a medida. Te das de alta, pruebas gratis y pagas solo si te sirve."
      />

      <Bloque>
        <article className="pt-herr-tarjeta pm-reveal">
          <div className="pt-herr-tarjeta__texto">
            <span className="pt-herr-chip">
              <span className="pt-herr-chip__punto" aria-hidden="true" /> Nuevo
            </span>
            <h2 className="pt-h2">{facturas.nombre}</h2>
            <p className="pt-herr-frase">{facturas.frase}</p>
            <p className="pt-text">{facturas.descripcion}</p>
            <ul className="pt-herr-puntos">
              {facturas.puntos.map((p) => (
                <li key={p}>
                  <Check />
                  {p}
                </li>
              ))}
            </ul>
            <EntradaHerramienta ruta={facturas.ruta} />
            <p className="pt-herr-prueba">{facturas.prueba}</p>
          </div>
          <FacturaLeyendose />
        </article>
      </Bloque>

      <Bloque id="planes">
        <div className="pt-centrado pm-reveal">
          <Antetitulo>Planes del lector de facturas</Antetitulo>
          <h2 className="pt-h2">
            Pagas según lo que <em>lees</em>.
          </h2>
          <p className="pt-text">
            Sin permanencia: cambias de plan o te das de baja cuando quieras. Precios al mes y sin IVA. Las facturas de
            ejemplo y los duplicados no cuentan.
          </p>
        </div>
        <div className="pt-herr-planes">
          {facturas.planes.map((p, i) => (
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
          <EntradaHerramienta ruta={facturas.ruta} />
          <p className="pt-herr-prueba">
            Empiezas con {facturas.prueba.charAt(0).toLowerCase() + facturas.prueba.slice(1)} El plan se elige y se paga
            con tarjeta dentro de la herramienta.
          </p>
        </div>
      </Bloque>

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

      <LlamadaFinal
        titulo={
          <>
            ¿Necesitas algo <em>a medida</em>?
          </>
        }
        texto="Si tu proceso no encaja en una herramienta hecha, lo automatizamos para tu empresa. El diagnóstico de 30 minutos es gratis."
        principal={{ label: 'Cuéntanos tu caso', to: '/contacto' }}
        secundaria={{ label: 'Ver servicios', to: '/servicios' }}
      />
    </>
  )
}
