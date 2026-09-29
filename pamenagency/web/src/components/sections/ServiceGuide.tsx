import { Link } from 'react-router-dom'
import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Icon } from '@/components/ui/Icon'
import { serviceGuide } from '@/content/serviceGuide'
import { getService } from '@/content/services'

/**
 * "Por dónde empezar", en /servicios.
 *
 * Con diez servicios en el catálogo, elegir por nombre es difícil si no
 * sabes qué hace cada uno. Esto no compara características: lista
 * situaciones concretas y apunta directamente al servicio que responde a
 * cada una.
 */
export function ServiceGuide() {
  return (
    <Section id="por-donde-empezar">
      <SectionHead
        eyebrow="Por dónde empezar"
        title="Si tu situación es esta, empieza aquí."
        lead="Diez servicios es mucho para elegir sin pistas. Busca la frase que más se parezca a tu caso."
      />

      <Reveal>
        <ul className="pm-serviceguide">
          {serviceGuide.map((row) => {
            const servicio = getService(row.slug)
            if (!servicio) return null
            return (
              <li key={row.slug} className="pm-serviceguide__row">
                <span className="pm-serviceguide__situacion">{row.situacion}</span>
                <Link to={`/servicios/${servicio.slug}`} className="pm-serviceguide__destino">
                  {servicio.name}
                  <Icon name="arrow" size={14} className="pm-btn__arrow" />
                </Link>
              </li>
            )
          })}
        </ul>
      </Reveal>
    </Section>
  )
}
