import { PageHead } from '@/components/ui/PageHead'
import { Section } from '@/components/ui/Section'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

/** Estructura común de las páginas legales. */
export function LegalPage({
  title,
  description,
  path,
  updated = '18 de agosto de 2026',
  children,
}: {
  title: string
  description: string
  path: string
  updated?: string
  children: React.ReactNode
}) {
  useSeo({
    title,
    description,
    path,
    // Las páginas legales no aportan nada en buscadores y se siguen enlazando.
    noindex: true,
    jsonLd: breadcrumbJsonLd([
      { name: 'Inicio', path: '/' },
      { name: title, path },
    ]),
  })

  return (
    <>
      <PageHead eyebrow="Legal" title={title} breadcrumb={[{ label: title }]} />

      <Section container="reading" divided={false}>
        <div className="pm-legal">
          {children}

          <p className="pm-muted" style={{ marginTop: 'var(--space-xl)', fontSize: 'var(--fs-small)' }}>
            Última actualización: {updated}.
          </p>
        </div>
      </Section>
    </>
  )
}
