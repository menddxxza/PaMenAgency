import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { DiagnosticTool } from './DiagnosticTool'

export function DiagnosticSection() {
  return (
    <Section id="diagnostico">
      <SectionHead
        align="center"
        eyebrow="Diagnóstico"
        title="Descubre cuánto potencial de IA tiene tu negocio"
        lead="Diez preguntas, dos minutos. Se calcula en tu propio navegador: no se envía ni se guarda ninguna respuesta."
      />
      <Reveal>
        <DiagnosticTool />
      </Reveal>
    </Section>
  )
}
