import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Icon } from '@/components/ui/Icon'
import { productos } from '@/content/products'

/**
 * Productos propios en producción — a diferencia de los casos de uso
 * (`UseCasesSection`), que son ejemplos hipotéticos por sector, esto es
 * trabajo real: cada tarjeta enlaza al sitio real y en marcha.
 */
export function ProductsSection() {
  return (
    <Section id="productos">
      <SectionHead
        eyebrow="Lo que construimos nosotros mismos"
        title="No solo lo explicamos. Lo construimos."
        lead="Tres productos propios en producción, no maquetas ni promesas. Cada enlace lleva al sitio real."
      />

      <div className="pm-grid pm-grid--cards">
        {productos.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 3) * 90}>
            <article className="pm-card pm-card--link">
              <span className="pm-card__icon" aria-hidden="true">
                <Icon name={p.icon} size={22} />
              </span>

              <h3 className="pm-card__title">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pm-card__cover"
                >
                  {p.nombre}
                </a>
              </h3>

              <p style={{ color: 'var(--pm-gold)', fontSize: '0.85rem', marginTop: '-0.4rem' }}>
                {p.tagline}
              </p>

              <p className="pm-card__text">{p.descripcion}</p>

              <p className="pm-card__benefit">
                <Icon name="check" size={15} />
                <span>{p.prueba}</span>
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
