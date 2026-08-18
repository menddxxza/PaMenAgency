import { Section, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'

/** Bloque de cierre reutilizable al final de las páginas internas. */
export function CtaBand({
  title = '¿Y si empezamos?',
  text = 'Cuéntanos tu situación. Si no necesitas contratar nada, también te lo diremos.',
  primary = { label: 'Hablar con PA MEN AGENCY', to: '/contacto' },
  secondary = { label: 'Descubrir mi potencial', to: '/diagnostico' },
}: {
  title?: string
  text?: string
  primary?: { label: string; to: string }
  secondary?: { label: string; to: string } | null
}) {
  return (
    <Section divided={false}>
      <Reveal>
        <div className="pm-cta">
          <h2 className="pm-title" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
            {title}
          </h2>
          <p className="pm-lead" style={{ marginInline: 'auto', marginTop: '1rem' }}>
            {text}
          </p>
          <div className="pm-cta__actions">
            <Button to={primary.to} arrow>
              {primary.label}
            </Button>
            {secondary && (
              <Button to={secondary.to} variant="ghost">
                {secondary.label}
              </Button>
            )}
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
