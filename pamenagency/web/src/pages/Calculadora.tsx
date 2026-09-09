import { PageHead } from '@/components/ui/PageHead'
import { Section, Reveal } from '@/components/ui/Section'
import { CostCalculator } from '@/components/sections/CostCalculator'
import { CtaBand } from '@/components/sections/CtaBand'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

export default function Calculadora() {
  useSeo({
    title: 'Calculadora de coste operativo',
    description:
      'Calcula cuánto tiempo y dinero consumen hoy las tareas repetitivas de tu empresa. Sólo aritmética con tus propios datos: no estimamos ahorros ni prometemos resultados.',
    path: '/calculadora',
    jsonLd: breadcrumbJsonLd([
      { name: 'Inicio', path: '/' },
      { name: 'Calculadora', path: '/calculadora' },
    ]),
  })

  return (
    <>
      <PageHead
        eyebrow="Calculadora"
        title="¿Cuánto te cuesta hoy lo repetitivo?"
        lead="La mayoría de empresas nunca ha puesto un número a esto. Introduce tus datos y te devolvemos la cuenta — sin estimar ahorros ni prometer nada: sólo tus propias cifras multiplicadas."
        breadcrumb={[{ label: 'Calculadora' }]}
      />

      <Section divided={false}>
        <Reveal>
          <CostCalculator />
        </Reveal>
      </Section>

      <CtaBand
        title="Ya tienes el número. ¿Y ahora?"
        text="Saber lo que cuesta es el primer paso. Saber qué parte se puede recuperar exige mirar tus procesos uno a uno, y eso es justo lo que hace la auditoría."
        primary={{ label: 'Solicitar auditoría de IA', to: '/auditoria-ia' }}
        secondary={{ label: 'Diagnóstico gratuito', to: '/diagnostico' }}
      />
    </>
  )
}
