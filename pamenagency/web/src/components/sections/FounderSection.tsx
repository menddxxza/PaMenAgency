import { Section, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { founder } from '@/content/founder'

/**
 * Quién hay detrás. `compact` es la versión de la home: mismo contenido,
 * sin repetir el enlace a /nosotros cuando ya se está allí.
 */
export function FounderSection({ compact = false }: { compact?: boolean }) {
  return (
    <Section id="quien-hay-detras">
      <div className="pm-founder">
        <Reveal>
          <figure className="pm-founder__photo">
            <img
              src={founder.foto}
              alt={`${founder.nombre}, ${founder.cargo.toLowerCase()}`}
              width={800}
              height={1067}
              loading="lazy"
              decoding="async"
            />
          </figure>
        </Reveal>

        <Reveal delay={100}>
          <div>
            <p className="pm-eyebrow">Quién hay detrás</p>
            <h2 className="pm-title">
              Soy {founder.nombre}.
            </h2>

            <p className="pm-lead" style={{ marginTop: '1.25rem' }}>
              Fundador de PaMenAgency. Ayudo a pymes, autónomos y empresas a descubrir dónde la
              inteligencia artificial les ahorra tiempo o dinero de verdad, y a implantarla sin
              complicarles la vida.
            </p>

            <ul className="pm-founder__datos">
              <li>
                <strong>{founder.anosExperiencia} años</strong>
                <span>en el sector</span>
              </li>
              <li>
                <strong>{founder.formacionesIa} formaciones</strong>
                <span>en inteligencia artificial</span>
              </li>
              <li>
                <strong>{founder.productos.length} productos propios</strong>
                <span>{founder.productos.join(', ')}</span>
              </li>
            </ul>

            <p className="pm-founder__lema">
              Y sobre todo: <span className="pm-gold">{founder.lema.toLowerCase()}</span>
            </p>
            <p style={{ color: 'var(--pm-text-soft)', marginTop: '0.5rem' }}>
              Si la IA no te va a aportar nada, te lo digo antes de cobrarte un euro.
            </p>

            <div className="pm-row" style={{ marginTop: '1.75rem' }}>
              <Button to="/auditoria-ia" arrow>
                Hablar conmigo
              </Button>
              {compact && (
                <Button to="/nosotros" variant="ghost">
                  Conocer la agencia
                </Button>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
