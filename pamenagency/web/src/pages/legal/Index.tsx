import { Link } from 'react-router-dom'
import { PageHead } from '@/components/ui/PageHead'
import { Section, Reveal } from '@/components/ui/Section'
import { useSeo } from '@/lib/seo'

const documentos = [
  { to: '/legal/aviso-legal', titulo: 'Aviso legal', texto: 'Datos identificativos del titular y condiciones generales de uso.' },
  { to: '/legal/privacidad', titulo: 'Política de privacidad', texto: 'Qué datos tratamos, con qué finalidad y qué derechos tienes.' },
  { to: '/legal/cookies', titulo: 'Política de cookies', texto: 'Qué almacenamiento usa la web y cómo cambiar tu elección.' },
  { to: '/legal/terminos', titulo: 'Términos y condiciones', texto: 'Condiciones de uso del sitio y del formulario de contacto.' },
  { to: '/legal/tratamiento-de-datos', titulo: 'Tratamiento de datos', texto: 'Detalle por actividad de cada tratamiento de datos personales.' },
  { to: '/legal/preferencias-cookies', titulo: 'Preferencias de cookies', texto: 'Consulta y modifica las categorías que has aceptado.' },
]

export default function LegalIndex() {
  useSeo({
    title: 'Información legal',
    description: 'Aviso legal, privacidad, cookies, términos y tratamiento de datos de PaMenAgency.',
    path: '/legal',
    noindex: true,
  })

  return (
    <>
      <PageHead
        eyebrow="Legal"
        title="Información legal"
        lead="Todos los documentos legales del sitio, en un solo sitio."
        breadcrumb={[{ label: 'Legal' }]}
      />

      <Section divided={false}>
        <div className="pm-grid pm-grid--cards">
          {documentos.map((doc, i) => (
            <Reveal key={doc.to} delay={(i % 3) * 70}>
              <article className="pm-card pm-card--link">
                <h2 className="pm-card__title">
                  <Link to={doc.to} className="pm-card__cover">
                    {doc.titulo}
                  </Link>
                </h2>
                <p className="pm-card__text">{doc.texto}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  )
}
