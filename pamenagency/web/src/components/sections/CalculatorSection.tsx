import { Section, SectionHead, Reveal } from '@/components/ui/Section'
import { CostCalculator } from './CostCalculator'

/** La calculadora en la home. Misma herramienta que en `/calculadora`. */
export function CalculatorSection() {
  return (
    <Section id="calculadora">
      <SectionHead
        eyebrow="Calculadora"
        title="¿Cuánto te cuesta hoy lo repetitivo?"
        lead="Introduce tus datos y te devolvemos la cuenta. No estimamos ahorros ni prometemos nada: son tus propias cifras multiplicadas, que es un número que casi nadie ha calculado."
        align="center"
      />
      <Reveal>
        <CostCalculator />
      </Reveal>
    </Section>
  )
}
