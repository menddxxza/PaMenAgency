import { Section, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { FACTOR } from '@/content/workday'
import { WorkdayCompare } from './WorkdayCompare'

export function WorkdaySection() {
  return (
    <Section id="jornada">
      <div className="pm-workday-section">
        <Reveal>
          <div>
            <p className="pm-eyebrow">Una jornada, dos formas de trabajar</p>
            <h2 className="pm-title">
              Hasta <span className="pm-gold">x{FACTOR} más rápido</span> en las tareas que se
              repiten.
            </h2>
            <p className="pm-lead" style={{ marginTop: '1.25rem' }}>
              Las mismas seis tareas, la misma jornada. A mano da tiempo a una. Con IA, a las seis
              — y la tarde queda libre para lo que de verdad necesita a una persona.
            </p>
            <div className="pm-row" style={{ marginTop: '1.75rem' }}>
              <Button to="/auditoria-ia" arrow>
                Ver qué puedo automatizar
              </Button>
              <Button to="/calculadora" variant="ghost">
                Calcular lo que me cuesta hoy
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div>
            <WorkdayCompare />
            <p className="pm-workday__nota">
              Simulación ilustrativa con tareas repetitivas habituales. El resultado real depende
              de cada proceso.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
