import { PageHead } from '@/components/ui/PageHead'
import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Icon } from '@/components/ui/Icon'
import { ReferralForm } from '@/components/sections/ReferralForm'
import { referral } from '@/content/referrals'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

export default function Referidos() {
  useSeo({
    title: 'Programa de referidos',
    description:
      'Recomienda PaMenAgency y consigue un descuento en tu próximo servicio cuando la persona que refieras contrate.',
    path: '/referidos',
    jsonLd: breadcrumbJsonLd([
      { name: 'Inicio', path: '/' },
      { name: 'Referidos', path: '/referidos' },
    ]),
  })

  return (
    <>
      <PageHead
        eyebrow="Programa de referidos"
        title="Recomiéndanos, gana los dos"
        lead={`Si conoces a alguien a quien la IA le podría ayudar, dínoslo. Si contrata, tú te llevas ${referral.recompensaQuienRefiere.toLowerCase()} y la persona referida ${referral.recompensaReferido.toLowerCase()}.`}
        breadcrumb={[{ label: 'Referidos' }]}
      />

      <Section>
        <SectionHead eyebrow="Cómo funciona" title="Tres pasos, sin papeleo" />
        <div className="pm-grid pm-grid--cards">
          {referral.pasos.map((paso, i) => (
            <Reveal key={paso.titulo} delay={i * 80}>
              <div className="pm-card">
                <span className="pm-card__icon" aria-hidden="true">
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{i + 1}</span>
                </span>
                <h3 className="pm-card__title">{paso.titulo}</h3>
                <p className="pm-card__text">{paso.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="Condiciones" title="Sin letra pequeña rara" />
        <Reveal>
          <ul className="pm-stack">
            {referral.condiciones.map((c) => (
              <li key={c} className="pm-row" style={{ alignItems: 'flex-start', gap: '0.6rem' }}>
                <span style={{ color: 'var(--pm-gold)', flex: 'none', marginTop: '3px', display: 'inline-flex' }}>
                  <Icon name="check" size={16} />
                </span>
                <span style={{ color: 'var(--pm-text-soft)' }}>{c}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      <Section>
        <SectionHead eyebrow="Recomendar" title="Cuéntanos a quién" />
        <Reveal>
          <ReferralForm />
        </Reveal>
      </Section>
    </>
  )
}
