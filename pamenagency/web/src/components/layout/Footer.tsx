import { Link } from 'react-router-dom'
import { legalNav, moreResources, site, tabs } from '@/content/site'
import { openCookieSettings } from '@/lib/consent'
import { Logo } from './Logo'

/**
 * Pie: las seis pestañas, las páginas que ya no están en el menú (para que
 * sigan enlazadas y Google no las pierda), contacto y legal.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="pt-footer">
      <div className="pm-container">
        <div className="pt-footer__top">
          <div className="pt-footer__brand">
            <Logo variant="footer" />
            <p className="pt-footer__tagline">{site.tagline}</p>
          </div>

          <nav className="pt-footer__col" aria-label="Pestañas">
            <h2 className="pt-footer__title">La web</h2>
            <ul>
              {tabs.map((t) => (
                <li key={t.to}>
                  <Link to={t.to}>{t.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="pt-footer__col" aria-label="Más recursos">
            <h2 className="pt-footer__title">Más recursos</h2>
            <ul>
              {moreResources.map((r) => (
                <li key={r.to}>
                  <Link to={r.to}>{r.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="pt-footer__col">
            <h2 className="pt-footer__title">Escríbenos</h2>
            <ul>
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              {site.phone && (
                <li>
                  <a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a>
                </li>
              )}
              {site.social.map((s) =>
                s.url ? (
                  <li key={s.name}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.name}
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        </div>

        <div className="pt-footer__bottom">
          <p>
            © {year} {site.name}
          </p>
          <ul className="pt-footer__legal">
            {legalNav.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
            <li>
              <button type="button" onClick={openCookieSettings}>
                Configurar cookies
              </button>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
