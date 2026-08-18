import { PageHead } from '@/components/ui/PageHead'
import { CracksSection } from '@/components/sections/CracksSection'
import { CtaBand } from '@/components/sections/CtaBand'
import { Section, Reveal } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

export default function Grietas() {
  useSeo({
    title: 'Las grietas de la IA',
    description:
      'Alucinaciones, sesgos, privacidad, dependencia y automatizaciones mal planteadas. Los límites reales de la IA y qué hacer con cada uno.',
    path: '/grietas-de-la-ia',
    jsonLd: breadcrumbJsonLd([
      { name: 'Inicio', path: '/' },
      { name: 'Las grietas de la IA', path: '/grietas-de-la-ia' },
    ]),
  })

  return (
    <>
      <PageHead
        eyebrow="Las grietas de la IA"
        title="Conocer sus límites es parte de saber utilizarla"
        lead="Una estructura puede ser sólida y tener grietas. El problema nunca es la grieta: es no saber que está ahí y apoyar el peso justo encima."
        breadcrumb={[{ label: 'Las grietas de la IA' }]}
      />

      <CracksSection />

      <Section container="reading">
        <Reveal>
          <blockquote className="pm-quote">
            La finalidad de esta sección no es generar miedo. Es que uses la IA con las manos en el
            volante.
          </blockquote>
          <p style={{ color: 'var(--pm-text-soft)', marginTop: '1.5rem' }}>
            Ninguno de estos límites es motivo para no usar Inteligencia Artificial. Todos son
            motivo para usarla sabiendo qué esperar. La versión larga, con ejemplos de dónde
            aparece cada fallo, está en la guía completa.
          </p>
          <div className="pm-row" style={{ marginTop: '1.75rem' }}>
            <Button to="/conocimiento/las-grietas-de-la-ia" arrow>
              Leer la guía completa
            </Button>
          </div>
        </Reveal>
      </Section>

      <CtaBand
        title="¿Quieres revisar lo que ya tienes montado?"
        text="Si ya usas IA o tienes automatizaciones funcionando, una revisión suele encontrar dos o tres de estas grietas abiertas."
        secondary={null}
      />
    </>
  )
}
