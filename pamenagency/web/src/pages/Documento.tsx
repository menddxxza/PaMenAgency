import { Fragment, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { PageHead } from '@/components/ui/PageHead'
import { Icon } from '@/components/ui/Icon'
import { CtaBand } from '@/components/sections/CtaBand'
import {
  docs,
  getDoc,
  getDocNeighbours,
  readingTime,
  type Block,
  type KnowledgeDoc,
} from '@/content/knowledge'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'
import { useReadingProgress, useRevealRoot } from '@/lib/motion'
import { site } from '@/content/site'

/** Convierte `**texto**` en negrita sin recurrir a HTML sin sanear. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  )
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'p':
      return (
        <p>
          <RichText text={block.text} />
        </p>
      )
    case 'h3':
      return <h3>{block.text}</h3>
    case 'ul':
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol>
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ol>
      )
    case 'callout':
      return (
        <aside className={`pm-callout${block.variant === 'warn' ? ' pm-callout--warn' : ''}`}>
          <p className="pm-callout__label">{block.label}</p>
          <p style={{ color: 'var(--pm-text-soft)' }}>
            <RichText text={block.text} />
          </p>
        </aside>
      )
    case 'quote':
      return (
        <blockquote className="pm-quote">
          <RichText text={block.text} />
        </blockquote>
      )
    case 'example':
      return (
        <div className="pm-example">
          <p className="pm-example__label">{block.label ?? 'Ejemplo'}</p>
          <p style={{ color: 'var(--pm-text-soft)' }}>
            <RichText text={block.text} />
          </p>
        </div>
      )
    case 'divider':
      return <hr style={{ border: 0, borderTop: '1px solid var(--pm-line)', margin: '2rem 0' }} />
  }
}

/** Marca en el índice el capítulo que se está leyendo. */
function useActiveChapter(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    if (!ids.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActive(visible.target.id)
      },
      // La banda superior de la ventana decide cuál es «el capítulo actual».
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 },
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [ids])

  return active
}

export default function Documento() {
  const { slug } = useParams()
  const doc = getDoc(slug)

  if (!doc) return <Navigate to="/conocimiento" replace />
  return <Lectura key={doc.slug} doc={doc} />
}

function Lectura({ doc }: { doc: KnowledgeDoc }) {
  const minutes = readingTime(doc)
  const { prev, next } = getDocNeighbours(doc.slug)
  const ids = doc.chapters.map((c) => c.id)
  const active = useActiveChapter(ids)
  const { ref: progressRef, progress } = useReadingProgress<HTMLDivElement>()
  const revealRef = useRevealRoot<HTMLDivElement>()

  useSeo({
    title: doc.title,
    description: doc.summary,
    path: `/conocimiento/${doc.slug}`,
    type: 'article',
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Conocimiento', path: '/conocimiento' },
        { name: doc.title, path: `/conocimiento/${doc.slug}` },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: doc.title,
        description: doc.summary,
        articleSection: doc.category,
        inLanguage: 'es-ES',
        dateModified: doc.updated,
        author: { '@type': 'Organization', name: site.name },
        publisher: { '@type': 'Organization', name: site.name },
        mainEntityOfPage: `${site.url}/conocimiento/${doc.slug}`,
      },
    ],
  })

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <div className="pm-progress" aria-hidden="true">
        <div className="pm-progress__fill" style={{ '--p': progress } as React.CSSProperties} />
      </div>

      <PageHead
        eyebrow="Centro de conocimiento"
        title={doc.title}
        lead={doc.summary}
        breadcrumb={[{ label: 'Conocimiento', to: '/conocimiento' }, { label: doc.title }]}
      >
        <div className="pm-doc__meta" style={{ marginTop: '1.5rem' }}>
          <span className="pm-badge pm-badge--gold">{doc.category}</span>
          <span className="pm-badge">Nivel: {doc.level}</span>
          <span className="pm-badge">
            <Icon name="clock" size={13} /> {minutes} min de lectura
          </span>
          <span className="pm-badge">{doc.chapters.length} capítulos</span>
        </div>
      </PageHead>

      <div className="pm-section" ref={progressRef}>
        <div className="pm-container pm-container--wide">
          <div className="pm-doc" ref={revealRef}>
            <nav className="pm-doc__toc" aria-label="Índice del documento">
              <p className="pm-doc__toctitle">Índice</p>
              {doc.chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  type="button"
                  className="pm-doc__toclink"
                  data-active={active === chapter.id}
                  onClick={() => goTo(chapter.id)}
                >
                  {chapter.title}
                </button>
              ))}
            </nav>

            <article className="pm-prose">
              <div className="pm-reveal">
                {doc.intro.map((block, i) => (
                  <div key={i} style={{ marginTop: i === 0 ? 0 : '1.15rem' }}>
                    <BlockView block={block} />
                  </div>
                ))}
              </div>

              {doc.chapters.map((chapter, ci) => (
                <section key={chapter.id} aria-labelledby={`${chapter.id}-h`}>
                  <h2 id={chapter.id}>
                    <span id={`${chapter.id}-h`}>{chapter.title}</span>
                  </h2>

                  {chapter.blocks.map((block, i) => (
                    <BlockView key={i} block={block} />
                  ))}

                  {/* Navegación entre capítulos, útil en documentos largos. */}
                  <nav
                    className="pm-row"
                    style={{
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      marginTop: '2rem',
                      paddingTop: '1rem',
                      borderTop: '1px dashed var(--pm-line)',
                      fontSize: 'var(--fs-small)',
                    }}
                    aria-label={`Navegación del capítulo ${ci + 1}`}
                  >
                    <button
                      type="button"
                      className="pm-footer__link"
                      onClick={() => goTo(doc.chapters[ci - 1]?.id ?? chapter.id)}
                      disabled={ci === 0}
                      style={{ opacity: ci === 0 ? 0.35 : 1 }}
                    >
                      ← Anterior
                    </button>
                    <button
                      type="button"
                      className="pm-footer__link"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      Índice
                    </button>
                    <button
                      type="button"
                      className="pm-footer__link"
                      onClick={() => goTo(doc.chapters[ci + 1]?.id ?? chapter.id)}
                      disabled={ci === doc.chapters.length - 1}
                      style={{ opacity: ci === doc.chapters.length - 1 ? 0.35 : 1 }}
                    >
                      Siguiente →
                    </button>
                  </nav>
                </section>
              ))}

              {doc.conclusion && (
                <section aria-labelledby="conclusion-h">
                  <h2 id="conclusion">
                    <span id="conclusion-h">Conclusión</span>
                  </h2>
                  {doc.conclusion.map((block, i) => (
                    <BlockView key={i} block={block} />
                  ))}
                </section>
              )}

              <div className="pm-docnav">
                {prev ? (
                  <Link className="pm-docnav__item" to={`/conocimiento/${prev.slug}`}>
                    <span className="pm-docnav__dir">← Anterior</span>
                    <span className="pm-docnav__title">{prev.title}</span>
                  </Link>
                ) : (
                  <Link className="pm-docnav__item" to="/conocimiento">
                    <span className="pm-docnav__dir">← Volver</span>
                    <span className="pm-docnav__title">Centro de conocimiento</span>
                  </Link>
                )}

                {next ? (
                  <Link className="pm-docnav__item pm-docnav__item--next" to={`/conocimiento/${next.slug}`}>
                    <span className="pm-docnav__dir">Siguiente →</span>
                    <span className="pm-docnav__title">{next.title}</span>
                  </Link>
                ) : (
                  <Link className="pm-docnav__item pm-docnav__item--next" to="/conocimiento">
                    <span className="pm-docnav__dir">Ver todo →</span>
                    <span className="pm-docnav__title">
                      {docs.length} guías en el centro de conocimiento
                    </span>
                  </Link>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>

      <CtaBand
        title="¿Lo aplicamos a tu caso?"
        text="Si después de leer quieres que lo llevemos a tu situación concreta, escríbenos."
      />
    </>
  )
}
