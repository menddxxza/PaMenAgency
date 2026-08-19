import { Component, type ReactNode } from 'react'
import { site } from '@/content/site'

type Props = { children: ReactNode }
type State = { hasError: boolean }

/**
 * Red de seguridad para errores de render no previstos (p. ej. una API del
 * navegador que se comporta distinto en Safari). Sin esto, un error sin
 * capturar deja la pantalla de carga inicial congelada para siempre: aquí se
 * captura, se registra en consola y se ofrece una salida clara.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('Error de render capturado por ErrorBoundary:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: '#050506',
          color: '#F4F4F2',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '32rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Algo ha fallado al cargar la página</h1>
          <p style={{ color: '#8E8E96', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Prueba a recargar. Si el problema continúa, escríbenos a{' '}
            <a href={`mailto:${site.email}`} style={{ color: '#D4AF37' }}>
              {site.email}
            </a>
            .
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#D4AF37',
              color: '#050506',
              border: 'none',
              borderRadius: '999px',
              padding: '0.75rem 1.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Recargar
          </button>
        </div>
      </div>
    )
  }
}
