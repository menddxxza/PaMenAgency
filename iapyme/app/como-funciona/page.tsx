import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PreguntaFaq from '@/components/PreguntaFaq';
import Reveal from '@/components/Reveal';

export const metadata = {
  title: 'Cómo funciona · IAPyme',
  description:
    'Cómo comprar y vender soluciones de IA en IAPyme: sin comisión, con trato directo entre comprador y vendedor.',
  alternates: { canonical: '/como-funciona' },
};

type Grupo = {
  titulo: string;
  preguntas: { pregunta: string; respuesta: React.ReactNode }[];
};

const GRUPOS: Grupo[] = [
  {
    titulo: 'Para quien compra',
    preguntas: [
      {
        pregunta: '¿Qué es IAPyme?',
        respuesta:
          'Un catálogo de soluciones de IA ya hechas para pymes: automatizaciones, agentes, bots, apps y SaaS, organizadas por sector en vez de por tecnología. Buscas el problema que tienes, no la herramienta.',
      },
      {
        pregunta: '¿Cómo compro una solución?',
        respuesta:
          'Entras en la ficha del producto y rellenas el formulario de contacto. El vendedor recibe tu mensaje al momento y te responde directamente para cerrar los detalles e instalarlo.',
      },
      {
        pregunta: '¿Se paga a través de IAPyme?',
        respuesta:
          'No. El pago se acuerda directamente con el vendedor, fuera de la plataforma. IAPyme no gestiona cobros ni se queda con ninguna parte del precio.',
      },
      {
        pregunta: '¿Puedo dejar una reseña?',
        respuesta:
          'Sí, con cuenta iniciada, una reseña por producto. Ayuda a que el resto de compradores sepan qué esperar antes de contactar.',
      },
      {
        pregunta: '¿Qué pasa si el vendedor no responde?',
        respuesta:
          'Escríbenos a hola@iapymeapp.com con el nombre del producto y te ayudamos a resolverlo.',
      },
    ],
  },
  {
    titulo: 'Para quien vende',
    preguntas: [
      {
        pregunta: '¿Cuánto cuesta publicar?',
        respuesta: 'Nada. Publicar es gratis y no cobramos comisión sobre lo que vendas.',
      },
      {
        pregunta: '¿Cómo publico mi producto?',
        respuesta:
          'Creas una cuenta, entras en tu panel de vendedor y rellenas la ficha: problema que resuelve, cómo funciona, precio y tiempo de instalación. Antes de publicarse pasa por una revisión rápida.',
      },
      {
        pregunta: '¿Por qué hay revisión antes de publicar?',
        respuesta:
          'Para mantener el catálogo fiable: que cada ficha describa bien lo que ofrece y no haya contenido engañoso o spam. Si algo no encaja, te decimos el motivo para que lo corrijas y vuelvas a enviarla.',
      },
      {
        pregunta: '¿Cómo cobro a mis clientes?',
        respuesta:
          'Directamente, como prefieras: transferencia, Bizum, factura... IAPyme pone en contacto, el trato comercial es entre vosotros.',
      },
      {
        pregunta: '¿Me avisáis de los mensajes nuevos?',
        respuesta:
          'Sí. Cada vez que alguien pide información o deja una reseña en uno de tus productos, te llega un email al momento, además de verlo en tu panel.',
      },
    ],
  },
  {
    titulo: 'General',
    preguntas: [
      {
        pregunta: '¿Qué tipo de soluciones hay?',
        respuesta:
          'Automatizaciones, agentes de IA, bots, apps, webs, SaaS, scripts, templates y servicios, agrupados en 10 sectores: atención al cliente, salud, finanzas, marketing, productividad, ventas, ecommerce, educación, legal y recursos humanos.',
      },
      {
        pregunta: '¿Los productos están en español?',
        respuesta:
          'La mayoría sí. Los que están en inglés lo indican claramente en la ficha antes de que contactes.',
      },
      {
        pregunta: '¿Cómo os contacto?',
        respuesta: 'Escríbenos a hola@iapymeapp.com, respondemos en persona.',
      },
    ],
  },
];

export default function ComoFuncionaPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GRUPOS.flatMap((grupo) =>
      grupo.preguntas.map((p) => ({
        '@type': 'Question',
        name: p.pregunta,
        acceptedAnswer: {
          '@type': 'Answer',
          text: typeof p.respuesta === 'string' ? p.respuesta : '',
        },
      })),
    ),
  };

  return (
    <>
      <Header />

      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container-page py-12 sm:py-16">
        <div className="max-w-2xl">
          <p className="eyebrow">Cómo funciona</p>
          <h1 className="mt-3 text-display-s font-medium tracking-tight text-ink">
            Sin comisión. Sin intermediarios en el trato.
          </h1>
          <p className="mt-4 leading-relaxed text-ink/70">
            IAPyme conecta directamente a quien necesita una solución de IA con quien la ha
            construido. Nosotros ponemos el catálogo, la revisión y el contacto; el trato
            comercial es siempre entre vosotros dos.
          </p>
        </div>

        <div className="mt-16 space-y-16">
          {GRUPOS.map((grupo, i) => (
            <Reveal key={grupo.titulo} delay={Math.min(i, 3) * 60}>
              <section>
                <h2 className="eyebrow">{grupo.titulo}</h2>
                <div className="regla mt-3" />
                <div className="mt-2">
                  {grupo.preguntas.map((p) => (
                    <PreguntaFaq key={p.pregunta} pregunta={p.pregunta}>
                      {p.respuesta}
                    </PreguntaFaq>
                  ))}
                </div>
              </section>
            </Reveal>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
