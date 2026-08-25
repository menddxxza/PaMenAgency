import { useState } from 'react'
import { PageHead } from '@/components/ui/PageHead'
import { Section, Reveal } from '@/components/ui/Section'
import { DocCard } from '@/components/sections/DocCard'
import { CtaBand } from '@/components/sections/CtaBand'
import { docs, getCategories, upcomingTopics } from '@/content/knowledge'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'
import { site } from '@/content/site'

export default function Conocimiento() {
  const categories = ['Todas', ...getCategories()]
  const [filter, setFilter] = useState('Todas')

  useSeo({
    title: 'Centro de conocimiento',
    description:
      'Guías completas sobre Inteligencia Artificial, leídas dentro de la propia web: sin descargas, sin PDF y sin registro. Fundamentos, criterio, método y límites.',
    path: '/conocimiento',
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Conocimiento', path: '/conocimiento' },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Centro de conocimiento de PaMenAgency',
        url: `${site.url}/conocimiento`,
        hasPart: docs.map((d) => ({
          '@type': 'Article',
          headline: d.title,
          description: d.summary,
          url: `${site.url}/conocimiento/${d.slug}`,
        })),
      },
    ],
  })

  const shown = filter === 'Todas' ? docs : docs.filter((d) => d.category === filter)

  return (
    <>
      <PageHead
        eyebrow="Centro de conocimiento"
        title="Todo lo que sabemos, sin pedirte nada a cambio"
        lead="Cada guía se lee aquí dentro, maquetada y con su índice. No hay descargas, ni PDF incrustados, ni formulario que rellenar para acceder."
        breadcrumb={[{ label: 'Conocimiento' }]}
      />

      <Section divided={false}>
        <Reveal>
          <div className="pm-row" style={{ marginBottom: 'var(--space-lg)' }} role="group" aria-label="Filtrar por categoría">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className="pm-badge"
                aria-pressed={filter === cat}
                onClick={() => setFilter(cat)}
                style={
                  filter === cat
                    ? {
                        borderColor: 'var(--pm-gold-line)',
                        background: 'var(--pm-gold-soft)',
                        color: 'var(--pm-gold)',
                      }
                    : { cursor: 'pointer' }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="pm-grid pm-grid--cards">
          {shown.map((doc, i) => (
            <Reveal key={doc.slug} delay={(i % 3) * 80}>
              <DocCard doc={doc} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div
            style={{
              marginTop: 'var(--space-xl)',
              padding: 'clamp(1.35rem, 3vw, 2rem)',
              border: '1px dashed var(--pm-line-strong)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <p className="pm-eyebrow">En preparación</p>
            <p style={{ color: 'var(--pm-muted)', marginTop: '0.85rem', maxWidth: '62ch' }}>
              Estos son los temas sobre los que estamos trabajando. Aparecen aquí sin enlace
              porque todavía no existen: preferimos un hueco visible a una promesa vacía.
            </p>
            <div className="pm-row" style={{ marginTop: '1.25rem' }}>
              {upcomingTopics.map((t) => (
                <span className="pm-badge" key={t} style={{ opacity: 0.55 }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </Section>

      <CtaBand
        title="¿Echas en falta algún tema?"
        text="Si hay algo que te gustaría que explicásemos, dínoslo. Las guías salen de las preguntas que nos llegan."
        secondary={null}
      />
    </>
  )
}
