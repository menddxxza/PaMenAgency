import { Link } from 'react-router-dom'
import { footerNav, site } from '@/content/site'
import { openCookieSettings } from '@/lib/consent'
import { Logo } from './Logo'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="pm-footer">
      <div
        className="pm-glow"
        aria-hidden="true"
        style={{
          width: 'min(620px, 90vw)',
          height: '360px',
          left: '50%',
          top: '-180px',
          transform: 'translateX(-50%)',
          background: 'rgba(212, 175, 55, 0.09)',
        }}
      />

      <div className="pm-container pm-container--wide pm-above">
        <div className="pm-footer__top">
          <div>
            <Logo variant="footer" />
            <p className="pm-lead" style={{ marginTop: '1.25rem', maxWidth: '30ch' }}>
              {site.tagline}
            </p>
            <a
              className="pm-link"
              href={`mailto:${site.email}`}
              style={{ marginTop: '1.5rem' }}
            >
              {site.email}
            </a>
          </div>

          <div className="pm-footer__cols">
            {footerNav.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="pm-footer__coltitle">{col.title}</h2>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.to}>
                      <Link className="pm-footer__link" to={link.to}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div>
              <h2 className="pm-footer__coltitle">Social</h2>
              <ul>
                {site.social.map((s) => (
                  <li key={s.name}>
                    {s.url ? (
                      <a
                        className="pm-footer__link"
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {s.name}
                      </a>
                    ) : (
                      // Sin perfil publicado todavía: se muestra el canal sin
                      // enlazar en lugar de un enlace que no lleva a ningún sitio.
                      <span
                        className="pm-footer__link"
                        style={{ opacity: 0.5, cursor: 'default' }}
                        title="Perfil aún no publicado"
                      >
                        {s.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="pm-footer__bottom">
          <p>© {year} {site.name} — Todos los derechos reservados.</p>
          <div className="pm-row" style={{ gap: '1.25rem' }}>
            <button type="button" className="pm-footer__link" onClick={openCookieSettings}>
              Configurar cookies
            </button>
            <Link className="pm-footer__link" to="/legal/aviso-legal">
              Aviso legal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
