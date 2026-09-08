import { Section, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { auditSteps } from '@/content/audit'

/**
 * La banda de la auditoría: el punto de conversión principal de la home.
 *
 * Resume los seis pasos en una línea cada uno y manda a `/auditoria-ia`,
 * que es donde se explica entero y se puede solicitar.
 */
export function AuditBand() {
  return (
    <Section id="auditoria" divided={false}>
      <Reveal>
        <div className="pm-audit">
          <p className="pm-eyebrow">Auditoría de IA</p>
          <h2 className="pm-title" style={{ maxWidth: '22ch' }}>
            Descubre dónde la IA puede dejarte algo de verdad.
          </h2>
          <p className="pm-lead" style={{ marginTop: '1rem' }}>
            Analizamos cómo trabaja tu empresa y salimos con un mapa de oportunidades priorizadas:
            qué automatizar, en qué orden, qué impacto tiene con tus propios números y qué
            descartaríamos. Si la conclusión es que la IA no te aporta lo suficiente, también te lo
            decimos.
          </p>

          <ol className="pm-audit__steps">
            {auditSteps.map((step) => (
              <li key={step.num}>
                <span className="pm-audit__num" aria-hidden="true">
                  {step.num}
                </span>
                <span>
                  <strong>{step.titulo}</strong>
                  <span className="pm-muted"> — {step.resumen}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="pm-row" style={{ marginTop: 'var(--space-lg)' }}>
            <Button to="/auditoria-ia" arrow>
              Solicitar auditoría de IA
            </Button>
            <Button to="/diagnostico" variant="ghost">
              Antes, el diagnóstico gratuito
            </Button>
          </div>

          <p className="pm-audit__nota">
            <Icon name="check" size={15} />
            <span>El diagnóstico es gratuito y sin registro. La auditoría es el paso siguiente.</span>
          </p>
        </div>
      </Reveal>
    </Section>
  )
}
