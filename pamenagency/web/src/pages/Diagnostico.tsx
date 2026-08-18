import { PageHead } from '@/components/ui/PageHead'
import { Section, Reveal } from '@/components/ui/Section'
import { DiagnosticTool } from '@/components/sections/DiagnosticTool'
import { CtaBand } from '@/components/sections/CtaBand'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

export default function Diagnostico() {
  useSeo({
    title: 'Diagnóstico de IA',
    description:
      'Diez preguntas para saber qué potencial de automatización e IA tiene tu negocio. Se calcula en tu navegador: no se envía ni se guarda ninguna respuesta.',
    path: '/diagnostico',
    jsonLd: breadcrumbJsonLd([
      { name: 'Inicio', path: '/' },
      { name: 'Diagnóstico', path: '/diagnostico' },
    ]),
  })

  return (
    <>
      <PageHead
        eyebrow="Diagnóstico"
        title="Descubre cuánto potencial de IA tiene tu negocio"
        lead="Diez preguntas, dos minutos. El resultado señala por dónde empezar a mirar; no incluye estimaciones económicas, porque cualquier cifra sin conocer tu caso sería inventada."
        breadcrumb={[{ label: 'Diagnóstico' }]}
      />

      <Section divided={false}>
        <Reveal>
          <DiagnosticTool />
        </Reveal>
      </Section>

      <CtaBand
        title="¿Comentamos tu resultado?"
        text="Si quieres, lo revisamos contigo y te decimos por dónde empezaríamos nosotros."
        secondary={null}
      />
    </>
  )
}
