import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useSpotlight } from '@/lib/motion'
import { readingTime, type KnowledgeDoc } from '@/content/knowledge'

export function DocCard({ doc }: { doc: KnowledgeDoc }) {
  const spotlight = useSpotlight()
  const minutes = readingTime(doc)

  return (
    <article className="pm-card pm-card--link" {...spotlight}>
      <div className="pm-row" style={{ gap: '0.4rem' }}>
        <span className="pm-badge pm-badge--gold">{doc.category}</span>
        <span className="pm-badge">{doc.level}</span>
      </div>

      <h3 className="pm-card__title" style={{ marginTop: '0.35rem' }}>
        <Link to={`/conocimiento/${doc.slug}`} className="pm-card__cover">
          {doc.title}
        </Link>
      </h3>

      <p className="pm-card__text">{doc.summary}</p>

      <div className="pm-card__benefit" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="pm-row" style={{ gap: '0.4rem', color: 'var(--pm-muted)' }}>
          <Icon name="clock" size={15} />
          {minutes} min de lectura
        </span>
        <span className="pm-link" aria-hidden="true">
          Leer guía
          <Icon name="arrow" size={14} className="pm-btn__arrow" />
        </span>
      </div>
    </article>
  )
}
