import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { getService } from '@/content/services'

/**
 * Lo que ocurre de verdad ahí fuera. Sin cifras: no las tenemos medidas.
 * Cada problema enlaza con el servicio que lo aborda, para que la lista
 * no sea sólo un diagnóstico sino también un punto de entrada.
 */
const problemas = [
  {
    text: 'No saben por dónde empezar, y empezar mal cuesta más que no empezar.',
    fix: 'Por eso existe la consultoría: miramos tu caso concreto antes de proponer nada.',
    service: 'consultoria-de-ia',
  },
  {
    text: 'Usan herramientas de IA sin estrategia, a golpe de novedad.',
    fix: 'La estrategia decide qué merece implementarse y en qué orden, antes de tocar ninguna herramienta.',
    service: 'estrategia-de-ia',
  },
  {
    text: 'Pagan suscripciones que se solapan o que nadie usa.',
    fix: 'Revisar qué se usa de verdad suele ser el primer ahorro, y sale de la propia consultoría.',
    service: 'consultoria-de-ia',
  },
  {
    text: 'Desconocen qué parte de su trabajo es automatizable.',
    fix: 'Analizamos tu día a día y señalamos qué tareas son candidatas reales a automatizar.',
    service: 'automatizacion',
  },
  {
    text: 'Tienen herramientas que no se hablan entre ellas.',
    fix: 'Conectamos lo que ya usas para que la información deje de moverse a mano.',
    service: 'integracion-de-ia',
  },
  {
    text: 'No saben detectar dónde está la oportunidad real.',
    fix: 'Es el punto de partida de cualquier consultoría bien hecha: encontrar la oportunidad, no venderla.',
    service: 'consultoria-de-ia',
  },
  {
    text: 'Usan la IA únicamente para generar texto, que es su uso con menos recorrido.',
    fix: 'Te enseñamos a ir más allá de redactar: clasificar, extraer, priorizar, resumir.',
    service: 'ia-para-productividad',
  },
  {
    text: 'Han probado algo, no ha funcionado y han concluido que «esto no es para mí».',
    fix: 'Casi siempre es un problema de método, no de herramienta. Se resuelve con formación aplicada.',
    service: 'formacion',
  },
]

export function Problem() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <Section id="el-problema">
      <SectionHead
        eyebrow="El punto de partida"
        title={
          <>
            La IA no es el futuro. <span className="pm-gold">Ya está aquí.</span>
          </>
        }
        lead="El problema dejó de ser el acceso a la tecnología: hoy la tiene cualquiera. El problema es que casi nadie sabe qué hacer con ella, y eso produce una distancia enorme entre quien la usa y quien la aprovecha. Toca cada punto para ver cómo lo abordamos."
      />

      <div className="pm-split pm-split--textwide">
        <Reveal>
          <ul className="pm-painlist">
            {problemas.map((p, i) => {
              const service = getService(p.service)
              const isOpen = open === i
              return (
                <li className="pm-painlist__item" data-open={isOpen} key={p.text}>
                  <button
                    type="button"
                    className="pm-painlist__trigger pm-accordion__trigger"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="pm-painlist__label">
                      <Icon name="alert" size={17} />
                      <span>{p.text}</span>
                    </span>
                    <span className="pm-accordion__icon" aria-hidden="true" />
                  </button>
                  <div className="pm-accordion__panel" data-open={isOpen}>
                    <div className="pm-accordion__panelinner">
                      <div className="pm-accordion__body" style={{ paddingTop: 0 }}>
                        <p>{p.fix}</p>
                        {service && (
                          <Link
                            to={`/servicios/${service.slug}`}
                            className="pm-link"
                            style={{ display: 'inline-flex', marginTop: '0.6rem' }}
                          >
                            Ver {service.name}
                            <Icon name="arrow" size={14} className="pm-btn__arrow" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
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
