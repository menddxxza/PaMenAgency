import { Link } from 'react-router-dom'
import { PageHead } from '@/components/ui/PageHead'
import { Section, Reveal } from '@/components/ui/Section'
import { Icon } from '@/components/ui/Icon'
import { updates } from '@/content/updates'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

const formateaFecha = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

export default function Novedades() {
  useSeo({
    title: 'Novedades',
    description: 'Qué hemos añadido a la web y a la agencia, con fecha, sin relleno de marketing.',
    path: '/novedades',
    jsonLd: breadcrumbJsonLd([
      { name: 'Inicio', path: '/' },
      { name: 'Novedades', path: '/novedades' },
    ]),
  })

  return (
    <>
      <PageHead
        eyebrow="Novedades"
        title="Qué ha cambiado"
        lead="Un registro de lo que añadimos de verdad, con su fecha. Si un mes no hay nada aquí, es que no ha cambiado nada significativo."
        breadcrumb={[{ label: 'Novedades' }]}
      />

      <Section divided={false}>
        <ol className="pm-updates">
          {updates.map((u, i) => (
            <Reveal as="li" key={u.titulo + u.fecha} delay={(i % 4) * 70}>
              <article className="pm-update">
                <time className="pm-update__fecha" dateTime={u.fecha}>
                  {formateaFecha(u.fecha)}
                </time>
                <h2 className="pm-update__titulo">{u.titulo}</h2>
                <p className="pm-update__texto">{u.texto}</p>
                {u.to && (
                  <Link to={u.to} className="pm-link">
                    Verlo
                    <Icon name="arrow" size={13} className="pm-btn__arrow" />
                  </Link>
                )}
              </article>
            </Reveal>
          ))}
        </ol>
      </Section>
    </>
  )
}
