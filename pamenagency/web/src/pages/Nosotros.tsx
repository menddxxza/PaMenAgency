import { Antetitulo, Bloque, CabeceraPestana, LlamadaFinal, escalon } from '@/components/pestanas/Bloques'
import { founder } from '@/content/founder'
import { breadcrumbJsonLd, organizationJsonLd, useSeo } from '@/lib/seo'

const formacion = [
  { curso: 'Domina ChatGPT: Automatiza, Crea y Ahorra Tiempo con IA', emisor: 'HoyAprendo' },
  { curso: 'Domina VEO3: Guía Rápida para Principiantes', emisor: 'HoyAprendo' },
  { curso: 'Claude: cómo utilizarlo como un profesional', emisor: 'HoyAprendo' },
  { curso: 'Iniciación al Desarrollo con IA (Programa con Agentes)', emisor: 'BIG School × MoureDev' },
]

const diferencias = [
  {
    titulo: 'Decimos que no',
    texto:
      'Si la IA no aporta nada en tu caso, lo decimos antes de cobrar. Un proyecto que no debía existir es el peor resultado posible para las dos partes.',
  },
  {
    titulo: 'Publicamos lo que sabemos',
    texto:
      'El centro de conocimiento es abierto y sin registro. Si con lo que hay ahí resuelves lo tuyo, ya ha servido para algo.',
  },
  {
    titulo: 'Empezamos pequeño',
    texto:
      'Una mejora que funciona genera más cambio que un plan de doce meses que nunca arranca del todo.',
  },
  {
    titulo: 'Contamos los límites',
    texto:
      'Dedicamos una sección entera a lo que la IA hace mal. No por prudencia comercial, sino porque ahí está la mayoría de los problemas serios.',
  },
]

/** Pestaña Nosotros: quién hay detrás, por qué existe la agencia y cómo decide. */
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
      <CabeceraPestana
        antetitulo="Nosotros"
        titulo={
          <>
            La IA no debe sustituir tu capacidad. Debe <em>multiplicarla</em>.
          </>
        }
        entradilla="Esa frase no es un eslogan: es el criterio con el que decidimos qué proyectos aceptamos y cuáles no."
      />

      <Bloque className="pt-block--pegado">
        <div className="pt-persona">
          <figure className="pt-persona__foto pm-reveal">
            <img
              src={founder.foto}
              alt={`${founder.nombre}, ${founder.cargo}`}
              width={800}
              height={1067}
              decoding="async"
            />
          </figure>
          <div className="pm-reveal" style={escalon(1, 120)}>
            <Antetitulo>Quién hay detrás</Antetitulo>
            <h2 className="pt-h2">
              Soy <em>{founder.nombre}</em>.
            </h2>
            <p className="pt-text">
              Fundador de PaMenAgency. Ayudo a pymes, autónomos y empresas a descubrir dónde la
              inteligencia artificial les ahorra tiempo o dinero de verdad, y a implantarla sin
              complicarles la vida.
            </p>
            <dl className="pt-datos">
              <div>
                <dt>{founder.anosExperiencia} años</dt>
                <dd>en el sector</dd>
              </div>
              <div>
                <dt>{founder.formacionesIa} formaciones</dt>
                <dd>en inteligencia artificial</dd>
              </div>
              <div>
                <dt>{founder.productos.length} productos propios</dt>
                <dd>{founder.productos.join(', ')}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Bloque>

      <Bloque estrecho>
        <div className="pm-reveal">
          <Antetitulo>Por qué existimos</Antetitulo>
          <h2 className="pt-h2">
            El problema no es la tecnología. Es la falta de <em>método</em>.
          </h2>
          <p className="pt-text">
            Hoy cualquiera puede abrir una herramienta de IA y usarla en treinta segundos. Y sin
            embargo, la distancia entre lo que esas herramientas pueden hacer y lo que la gente hace
            con ellas sigue siendo enorme.
          </p>
          <p className="pt-text">
            Nadie enseña a mirar un proceso, a descomponerlo, a decidir qué merece automatizarse y a
            comprobar después si sirvió de algo. PaMenAgency existe para cerrar esa distancia: en
            unos casos implementando; en otros, simplemente explicando. Las dos cosas cuentan.
          </p>
        </div>
      </Bloque>

      <Bloque className="pt-block--banda">
        <div className="pm-reveal">
          <Antetitulo>Filosofía</Antetitulo>
          <h2 className="pt-h2">
            Qué nos <em>diferencia</em>.
          </h2>
          <p className="pt-text">
            No es una lista de valores corporativos. Son cuatro decisiones que condicionan cómo
            trabajamos y a qué renunciamos.
          </p>
        </div>
        <ul className="pt-principios">
          {diferencias.map((d, i) => (
            <li key={d.titulo} className="pm-reveal" style={escalon(i % 2, 100)}>
              <h3>{d.titulo}</h3>
              <p>{d.texto}</p>
            </li>
          ))}
        </ul>
      </Bloque>

      <Bloque estrecho>
        <div className="pm-reveal">
          <Antetitulo>Formación</Antetitulo>
          <h2 className="pt-h2">
            Seguimos <em>formándonos</em>.
          </h2>
          <p className="pt-text">
            La IA cambia rápido. Estos son algunos de los cursos que hemos completado para
            mantenernos al día.
          </p>
        </div>
        <ul className="pt-cursos">
          {formacion.map((f, i) => (
            <li key={f.curso} className="pm-reveal" style={escalon(i)}>
              <span>{f.curso}</span>
              <span className="pt-cursos__emisor">{f.emisor}</span>
            </li>
          ))}
        </ul>
      </Bloque>

      <LlamadaFinal />
    </>
  )
}
