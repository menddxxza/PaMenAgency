import { Button } from '@/components/ui/Button'
import { useSeo } from '@/lib/seo'

export default function NotFound() {
  useSeo({
    title: 'Página no encontrada',
    description: 'La página que buscas no existe o ha cambiado de dirección.',
    path: '/404',
    noindex: true,
  })

  return (
    <div className="pm-notfound">
      <div className="pm-container">
        <p className="pm-notfound__code pm-wordmark">404</p>
        <h1 className="pm-title" style={{ marginTop: '1rem' }}>
          Esta página no existe
        </h1>
        <p className="pm-lead" style={{ marginInline: 'auto', marginTop: '1rem' }}>
          O ha cambiado de dirección. Desde aquí puedes volver al principio o ir directamente al
          centro de conocimiento.
        </p>
        <div className="pm-row" style={{ justifyContent: 'center', marginTop: '2rem' }}>
          <Button to="/" arrow>
            Volver al inicio
          </Button>
          <Button to="/conocimiento" variant="ghost">
            Centro de conocimiento
          </Button>
        </div>
      </div>
    </div>
  )
}
