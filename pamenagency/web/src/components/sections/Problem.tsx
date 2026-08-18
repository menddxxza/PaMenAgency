import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

/** Lo que ocurre de verdad ahí fuera. Sin cifras: no las tenemos medidas. */
const problemas = [
  'No saben por dónde empezar, y empezar mal cuesta más que no empezar.',
  'Usan herramientas de IA sin estrategia, a golpe de novedad.',
  'Pagan suscripciones que se solapan o que nadie usa.',
  'Desconocen qué parte de su trabajo es automatizable.',
  'Tienen herramientas que no se hablan entre ellas.',
  'No saben detectar dónde está la oportunidad real.',
  'Usan la IA únicamente para generar texto, que es su uso con menos recorrido.',
  'Han probado algo, no ha funcionado y han concluido que «esto no es para mí».',
]

export function Problem() {
  return (
    <Section id="el-problema">
      <SectionHead
        eyebrow="El punto de partida"
        title={
          <>
            La IA no es el futuro. <span className="pm-gold">Ya está aquí.</span>
          </>
        }
        lead="El problema dejó de ser el acceso a la tecnología: hoy la tiene cualquiera. El problema es que casi nadie sabe qué hacer con ella, y eso produce una distancia enorme entre quien la usa y quien la aprovecha."
      />

      <div className="pm-split pm-split--textwide">
        <Reveal>
          <ul className="pm-painlist">
            {problemas.map((p) => (
              <li key={p}>
                <Icon name="alert" size={17} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <div
            style={{
              padding: 'clamp(1.5rem, 3vw, 2.25rem)',
              border: '1px solid var(--pm-gold-line)',
              borderRadius: 'var(--radius-lg)',
              background:
                'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(212,175,55,0.10), transparent 70%), var(--pm-black)',
            }}
          >
            <p className="pm-eyebrow">Dónde estamos nosotros</p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.15rem, 2.4vw, 1.5rem)',
                lineHeight: 1.35,
                marginTop: '1rem',
              }}
            >
              PaMenAgency es el puente entre{' '}
              <span className="pm-muted">«sé que existe la IA»</span> y{' '}
              <span className="pm-gold">
                «sé exactamente cómo utilizarla para mejorar mi situación»
              </span>
              .
            </p>
            <p style={{ color: 'var(--pm-muted)', marginTop: '1.25rem', fontSize: '0.95rem' }}>
              Ese puente no se cruza comprando una herramienta más. Se cruza con método: mirar el
              problema, descomponerlo, decidir qué merece automatizarse y comprobar si funcionó.
            </p>
            <div className="pm-row" style={{ marginTop: '1.75rem' }}>
              <Button to="/diagnostico" size="sm" arrow>
                Descubrir mi potencial
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
