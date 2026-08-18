import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Scene3D } from '@/components/three/Scene3D'
import { useParallax } from '@/lib/motion'

const principios = [
  'Si la IA no aporta algo en tu caso, lo decimos. Es más barato para todos.',
  'Explicamos en lenguaje claro. Los tecnicismos suelen esconder la falta de argumento.',
  'Empezamos por lo pequeño que funciona, no por lo grande que impresiona.',
  'Lo que implantamos queda documentado: no dependes de nosotros para entenderlo.',
  'Trabajamos igual con una persona sola que con una empresa de cien.',
]

export function About() {
  const visualRef = useParallax<HTMLDivElement>(0.05)

  return (
    <Section id="quienes-somos">
      <SectionHead
        eyebrow="Quiénes somos"
        title="La IA no debe sustituir tu capacidad. Debe multiplicarla."
        lead="PaMenAgency nace de una observación bastante simple: la distancia entre lo que la Inteligencia Artificial puede hacer y lo que la gente hace realmente con ella es enorme, y esa distancia no la cierra la tecnología."
      />

      <div className="pm-split pm-split--textwide">
        <div>
          <Reveal>
            <p style={{ color: 'var(--pm-text-soft)', marginBottom: '1.15rem' }}>
              Existimos para cerrarla. No vendiendo la herramienta de moda, sino enseñando a mirar:
              qué problema tienes, qué parte de él es automatizable, qué merece la pena y qué no.
            </p>
            <p style={{ color: 'var(--pm-text-soft)', marginBottom: '1.15rem' }}>
              Trabajamos con quien no sabe nada de IA y con quien ya lleva tiempo usándola sin
              obtener gran cosa. Con negocios de una persona y con empresas con varios
              departamentos. El método es el mismo; cambia la escala.
            </p>
            <p style={{ color: 'var(--pm-text-soft)', marginBottom: '2rem' }}>
              Y publicamos lo que sabemos. Puedes leer nuestras guías, hacer el diagnóstico y
              aplicar todo lo que encuentres sin contratar nada. Si después quieres ayuda, hablamos.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <ul className="pm-checklist">
              {principios.map((p) => (
                <li key={p}>
                  <Icon name="check" size={17} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={160}>
            <div className="pm-row" style={{ marginTop: '2rem' }}>
              <Button to="/nosotros" variant="ghost" arrow>
                Conocer la agencia
              </Button>
              <Button to="/metodologia" variant="solid">
                Ver metodología
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={80}>
          <div ref={visualRef} className="pm-visual">
            <Scene3D kind="core" className="pm-scene--fill" />
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
