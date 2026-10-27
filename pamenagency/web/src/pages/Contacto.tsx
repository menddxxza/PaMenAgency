import { Link } from 'react-router-dom'
import { Antetitulo, Bloque, CabeceraPestana } from '@/components/pestanas/Bloques'
import { ContactForm } from '@/components/sections/ContactForm'
import { Accordion } from '@/components/ui/Accordion'
import { CopyButton } from '@/components/ui/CopyButton'
import { faqs } from '@/content/faq'
import { site } from '@/content/site'
import { breadcrumbJsonLd, organizationJsonLd, useSeo } from '@/lib/seo'

const PREGUNTAS = 6

/** Pestaña Contacto: el formulario, las otras vías y las dudas de antes de escribir. */
export default function Contacto() {
  useSeo({
    title: 'Contacto',
    description:
      'Cuéntanos tu situación y te decimos qué haríamos, en qué orden y qué descartaríamos. Si no necesitas contratar nada, también te lo diremos.',
    path: '/contacto',
    jsonLd: [
      organizationJsonLd,
      breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Contacto', path: '/contacto' },
      ]),
    ],
  })

  return (
    <>
      <CabeceraPestana
        antetitulo="Contacto"
        titulo={
          <>
            ¿Y si <em>empezamos</em>?
          </>
        }
        entradilla="No hace falta que traigas nada preparado ni que sepas qué necesitas. Con que nos cuentes cómo es tu semana, sobra para empezar."
      />

      <Bloque id="contacto" className="pt-block--pegado">
        <div className="pt-contacto">
          <div className="pt-contacto__form pm-reveal">
            <ContactForm />
          </div>

          <aside className="pt-contacto__info pm-reveal" style={{ '--reveal-delay': '120ms' } as React.CSSProperties}>
            <div>
              <Antetitulo>Otras vías</Antetitulo>
              <p className="pt-contacto__via">
                <a href={`mailto:${site.email}`}>{site.email}</a>
                <CopyButton value={site.email} label="Email" />
              </p>
              {site.phone && (
                <p className="pt-contacto__via">
                  <a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a>
                  <CopyButton value={site.phone} label="Teléfono" />
                </p>
              )}
            </div>

            <div>
              <Antetitulo>Qué pasa después</Antetitulo>
              <ol className="pt-pasos">
                <li>Leemos tu mensaje y te respondemos por email.</li>
                <li>Si hace falta, hablamos media hora para entender el caso.</li>
                <li>Te decimos qué haríamos, en qué orden y qué descartaríamos.</li>
              </ol>
            </div>

            <p className="pt-nota">
              Solo pedimos los datos necesarios para responderte y no se comparten con nadie. Si
              prefieres no dejar ninguno, escríbenos directamente al correo.
            </p>
          </aside>
        </div>
      </Bloque>

      <Bloque id="preguntas" estrecho className="pt-block--banda">
        <div className="pm-reveal">
          <Antetitulo>Preguntas frecuentes</Antetitulo>
          <h2 className="pt-h2">
            Lo que suele preguntarse antes de <em>empezar</em>.
          </h2>
        </div>
        <div className="pm-reveal">
          <Accordion items={faqs.slice(0, PREGUNTAS)} />
        </div>
        <p className="pm-reveal" style={{ marginTop: 'var(--space-lg)' }}>
          <Link to="/faq" className="pt-arrowlink">
            <span>Ver las {faqs.length} preguntas</span>
            <span className="pt-arrowlink__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </p>
      </Bloque>
    </>
  )
}
