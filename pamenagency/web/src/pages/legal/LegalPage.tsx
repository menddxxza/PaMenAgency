import { PageHead } from '@/components/ui/PageHead'
import { Section } from '@/components/ui/Section'
import { Placeholder } from '@/components/ui/Placeholder'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

/**
 * Estructura común de las páginas legales.
 *
 * Los datos identificativos de la empresa aún no se han facilitado, así que
 * aparecen como marcadores visibles (`Placeholder`). No se inventa ningún dato
 * legal: un aviso legal con datos falsos es peor que uno incompleto.
 */
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
          <div
            className="pm-callout"
            style={{ marginBottom: 'var(--space-lg)' }}
            role="note"
          >
            <p className="pm-callout__label">Documento pendiente de completar</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--pm-text-soft)' }}>
              Los datos identificativos marcados como{' '}
              <Placeholder>DATO PENDIENTE</Placeholder> deben sustituirse por los reales antes de
              publicar el sitio. El texto es una base de trabajo y conviene que lo revise un
              profesional antes de su publicación definitiva.
            </p>
          </div>

          {children}

          <p className="pm-muted" style={{ marginTop: 'var(--space-xl)', fontSize: 'var(--fs-small)' }}>
            Última actualización: {updated}.
          </p>
        </div>
      </Section>
    </>
  )
}
