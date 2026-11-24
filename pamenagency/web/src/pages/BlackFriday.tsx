import { PageHead } from '@/components/ui/PageHead'
import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Icon } from '@/components/ui/Icon'
import { BlackFridayForm } from '@/components/sections/BlackFridayForm'
import { blackFriday } from '@/content/blackfriday'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

function Lista({ items }: { items: string[] }) {
  return (
    <ul className="pm-stack">
      {items.map((c) => (
        <li key={c} className="pm-row" style={{ alignItems: 'flex-start', gap: '0.6rem', flexWrap: 'nowrap' }}>
          <span style={{ color: 'var(--pm-gold)', flex: 'none', marginTop: '3px', display: 'inline-flex' }}><Icon name="check" size={16} /></span>
          <span style={{ color: 'var(--pm-text-soft)' }}>{c}</span>
        </li>
      ))}
    </ul>
  )
}

/** Black Friday 2026: 10 automatizaciones gratis a cambio de contar el caso. */
export default function BlackFriday() {
  useSeo({
    title: 'Black Friday: 10 automatizaciones gratis',
    description: `Este Black Friday no bajamos precios: regalamos una automatización a ${blackFriday.plazas} empresas a cambio de poder contar su caso. Apúntate hasta el ${blackFriday.cierreTexto}.`,
    path: '/blackfriday',
    jsonLd: breadcrumbJsonLd([{ name: 'Inicio', path: '/' }, { name: 'Black Friday', path: '/blackfriday' }]),
  })

  return (
    <>
      <PageHead
        eyebrow="Black Friday · solo hasta el 30 de noviembre"
        title={`Este Black Friday no bajamos precios. Regalamos ${blackFriday.plazas} automatizaciones.`}
        lead={`Elegimos ${blackFriday.plazas} empresas y les dejamos funcionando sola una tarea que hoy hacen a mano. Gratis. A cambio, solo te pedimos poder contar tu caso. Apúntate hasta el ${blackFriday.cierreTexto}.`}
        breadcrumb={[{ label: 'Black Friday' }]}
      />

      <Section>
        <SectionHead eyebrow="Qué te llevas" title="Gratis, de verdad" />
        <div className="pm-grid pm-grid--cards">
          {blackFriday.regalamos.map((r, i) => (
            <Reveal key={r.titulo} delay={i * 80}>
              <div className="pm-card">
                <span className="pm-card__icon" aria-hidden="true"><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{i + 1}</span></span>
                <h3 className="pm-card__title">{r.titulo}</h3>
                <p className="pm-card__text">{r.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="Qué te pedimos" title="Solo esto" />
        <Reveal><Lista items={blackFriday.pedimos} /></Reveal>
      </Section>

      <Section>
        <SectionHead eyebrow="Cómo elegimos" title={`No es un sorteo: elegimos ${blackFriday.plazas} casos`} />
        <Reveal><Lista items={blackFriday.elegimos} /></Reveal>
        <Reveal>
          <p style={{ marginTop: '1.25rem', color: 'var(--pm-muted)' }}>
            Te escribimos {blackFriday.avisoTexto}. Aunque no te elijamos, tienes el diagnóstico gratuito de 30 minutos.
          </p>
        </Reveal>
      </Section>

      <Section>
        <SectionHead eyebrow="Apúntate" title="Cuéntanos qué tarea repetís" />
        <Reveal><BlackFridayForm /></Reveal>
      </Section>

      <Section>
        <div id="bases" style={{ scrollMarginTop: '6rem' }}>
          <SectionHead eyebrow="Bases" title="Las condiciones, claras" />
        </div>
        <Reveal><Lista items={blackFriday.bases} /></Reveal>
      </Section>
    </>
  )
}
