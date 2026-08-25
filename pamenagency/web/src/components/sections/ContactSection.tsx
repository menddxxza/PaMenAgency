import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Icon } from '@/components/ui/Icon'
import { site } from '@/content/site'
import { ContactForm } from './ContactForm'

export function ContactSection() {
  return (
    <Section id="contacto">
      <SectionHead
        eyebrow="Contacto"
        title="¿Y si empezamos?"
        lead="Cuéntanos en qué situación estás. Si vemos que no necesitas contratar nada, te lo diremos y te indicaremos por dónde seguir por tu cuenta."
      />

      <div className="pm-split pm-split--reverse pm-split--textwide" style={{ alignItems: 'start' }}>
        <Reveal>
          <ContactForm />
        </Reveal>

        <Reveal delay={100}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <p className="pm-eyebrow">Otras vías</p>
              <a className="pm-link" href={`mailto:${site.email}`} style={{ marginTop: '1rem' }}>
                <Icon name="mail" size={16} />
                {site.email}
              </a>
              {site.phone && (
                <a className="pm-link" href={`tel:${site.phone}`} style={{ marginTop: '0.5rem' }}>
                  {site.phone}
                </a>
              )}
            </div>

            <div>
              <p className="pm-eyebrow">Qué pasa después</p>
              <ol className="pm-path__steps" style={{ marginTop: '1rem', gap: '0.6rem' }}>
                <li>
                  <span aria-hidden="true">01</span>
                  <span>Leemos tu mensaje y te respondemos por email.</span>
                </li>
                <li>
                  <span aria-hidden="true">02</span>
                  <span>Si hace falta, hablamos media hora para entender el caso.</span>
                </li>
                <li>
                  <span aria-hidden="true">03</span>
                  <span>Te decimos qué haríamos, en qué orden y qué descartaríamos.</span>
                </li>
              </ol>
            </div>

            <div
              style={{
                padding: '1.1rem 1.25rem',
                border: '1px solid var(--pm-line)',
                borderRadius: 'var(--radius)',
                background: 'var(--pm-surface)',
              }}
            >
              <p style={{ fontSize: '0.88rem', color: 'var(--pm-muted)' }}>
                Solo pedimos los datos necesarios para responderte y no se comparten con nadie.
                Si prefieres no dejar ninguno, escríbenos directamente al correo.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
