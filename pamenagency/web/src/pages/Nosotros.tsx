import { PageHead } from '@/components/ui/PageHead'
import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { Icon } from '@/components/ui/Icon'
import { CtaBand } from '@/components/sections/CtaBand'
import { MethodologySection } from '@/components/sections/MethodologySection'
import { Scene3D } from '@/components/three/Scene3D'
import { breadcrumbJsonLd, organizationJsonLd, useSeo } from '@/lib/seo'

const diferencias = [
  {
    icon: 'shield' as const,
    titulo: 'Decimos que no',
    texto:
      'Si la IA no aporta nada en tu caso, lo decimos antes de cobrar. Un proyecto que no debía existir es el peor resultado posible para las dos partes.',
  },
  {
    icon: 'book' as const,
    titulo: 'Publicamos lo que sabemos',
    texto:
      'El centro de conocimiento es abierto y sin registro. Si con lo que hay ahí resuelves lo tuyo, ya ha servido para algo.',
  },
  {
    icon: 'target' as const,
    titulo: 'Empezamos pequeño',
    texto:
      'Una mejora que funciona genera más cambio que un plan de doce meses que nunca arranca del todo.',
  },
  {
    icon: 'crack' as const,
    titulo: 'Contamos los límites',
    texto:
      'Dedicamos una sección entera a lo que la IA hace mal. No por prudencia comercial, sino porque ahí está la mayoría de los problemas serios.',
  },
]

export default function Nosotros() {
  useSeo({
    title: 'Quiénes somos',
    description:
      'PaMenAgency es una agencia de Inteligencia Artificial y centro de conocimiento. Por qué existimos, cómo entendemos la IA y qué nos diferencia.',
    path: '/nosotros',
    jsonLd: [
      organizationJsonLd,
      breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Quiénes somos', path: '/nosotros' },
      ]),
    ],
  })

  return (
    <>
      <PageHead
        eyebrow="Quiénes somos"
        title="La IA no debe sustituir tu capacidad. Debe multiplicarla."
        lead="Esa frase no es un eslogan: es el criterio con el que decidimos qué proyectos aceptamos y cuáles no."
        breadcrumb={[{ label: 'Quiénes somos' }]}
      />

      <Section>
        <div className="pm-split pm-split--textwide">
          <div>
            <Reveal>
              <h2 className="pm-title">Por qué existimos</h2>
              <p style={{ color: 'var(--pm-text-soft)', marginTop: '1.25rem' }}>
                La Inteligencia Artificial dejó de ser inaccesible hace tiempo. Hoy cualquiera puede
                abrir una herramienta y usarla en treinta segundos. Y sin embargo, la distancia
                entre lo que esas herramientas pueden hacer y lo que la gente hace con ellas sigue
                siendo enorme.
              </p>
              <p style={{ color: 'var(--pm-text-soft)', marginTop: '1rem' }}>
                Esa distancia no la explica la tecnología. La explica la falta de método: nadie
                enseña a mirar un proceso, a descomponerlo, a decidir qué merece automatizarse y a
                comprobar después si sirvió de algo.
              </p>
              <p style={{ color: 'var(--pm-text-soft)', marginTop: '1rem' }}>
                PaMenAgency existe para cerrar esa distancia. En unos casos implementando; en otros,
                simplemente explicando. Las dos cosas cuentan.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <h2 className="pm-title" style={{ marginTop: 'var(--space-xl)' }}>
                Qué problema resolvemos
              </h2>
              <p style={{ color: 'var(--pm-text-soft)', marginTop: '1.25rem' }}>
                El problema real casi nunca es «no tengo IA». Es tiempo que se va en tareas que no
                aportan nada, herramientas que no se hablan entre ellas, consultas que se responden
                veinte veces al día y decisiones que se toman sin datos porque reunirlos costaría
                una mañana.
              </p>
              <p style={{ color: 'var(--pm-text-soft)', marginTop: '1rem' }}>
                Sobre eso trabajamos. La IA aparece cuando aporta, y cuando no, aparece otra cosa:
                a veces la mejor solución es eliminar un paso, no automatizarlo.
              </p>
            </Reveal>
          </div>

          <Reveal delay={80}>
            <div className="pm-visual">
              <Scene3D kind="core" className="pm-scene--fill" />
            </div>
          </Reveal>
        </div>
      </Section>

      <Section>
        <SectionHead
          eyebrow="Filosofía"
          title="Qué nos diferencia"
          lead="No es una lista de valores corporativos. Son cuatro decisiones que condicionan cómo trabajamos y a qué renunciamos."
        />

        <div className="pm-grid pm-grid--cards">
          {diferencias.map((d, i) => (
            <Reveal key={d.titulo} delay={(i % 2) * 90}>
              <article className="pm-card">
                <span className="pm-card__icon" aria-hidden="true">
                  <Icon name={d.icon} size={22} />
                </span>
                <h3 className="pm-card__title">{d.titulo}</h3>
                <p className="pm-card__text">{d.texto}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="pm-split">
          <Reveal>
            <div>
              <h2 className="pm-title">Para quién trabajamos</h2>
              <ul className="pm-checklist" style={{ marginTop: '1.5rem' }}>
                {[
                  'Personas que parten de cero y quieren aprender bien desde el principio.',
                  'Autónomos y negocios pequeños sin equipo técnico ni presupuestos grandes.',
                  'PYMEs con procesos definidos y ganas de recuperar horas.',
                  'Empresas con varios departamentos que necesitan orden antes que herramientas.',
                  'Equipos que ya usan IA y sospechan que la están aprovechando a medias.',
                ].map((t) => (
                  <li key={t}>
                    <Icon name="check" size={17} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div>
              <h2 className="pm-title">Qué queremos conseguir</h2>
              <p style={{ color: 'var(--pm-text-soft)', marginTop: '1.5rem' }}>
                Que alguien pueda entrar en esta web sin saber nada de IA y salir sabiendo qué
                puede hacer, qué no puede hacer, qué oportunidades existen, qué riesgos hay y
                cuándo merece la pena pedir ayuda.
              </p>
              <p style={{ color: 'var(--pm-text-soft)', marginTop: '1rem' }}>
                Si además decide trabajar con nosotros, mejor. Pero el orden es ese, y no al revés.
              </p>
              <blockquote className="pm-quote" style={{ marginTop: '1.75rem' }}>
                Una herramienta que tiene todo el mundo no es una ventaja. La ventaja está en el
                criterio con el que se usa.
              </blockquote>
            </div>
          </Reveal>
        </div>
      </Section>

      <MethodologySection compact />
      <CtaBand />
    </>
  )
}
