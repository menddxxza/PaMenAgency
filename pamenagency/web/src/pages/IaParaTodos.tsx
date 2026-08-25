import { PageHead } from '@/components/ui/PageHead'
import { ForEveryone } from '@/components/sections/ForEveryone'
import { KnowledgeSection } from '@/components/sections/KnowledgeSection'
import { CtaBand } from '@/components/sections/CtaBand'
import { breadcrumbJsonLd, useSeo } from '@/lib/seo'

export default function IaParaTodos() {
  useSeo({
    title: 'IA para todos',
    description:
      'No necesitas ser experto en tecnología para aprovechar la IA. Siete caminos de entrada según tu punto de partida, con pasos concretos que puedes dar hoy.',
    path: '/ia-para-todos',
    jsonLd: breadcrumbJsonLd([
      { name: 'Inicio', path: '/' },
      { name: 'IA para todos', path: '/ia-para-todos' },
    ]),
  })

  return (
    <>
      <PageHead
        eyebrow="IA para todos"
        title="¿No sabes por dónde empezar?"
        lead="No necesitas ser experto en tecnología para aprovechar la IA. Busca abajo la frase que más se parezca a la tuya: cada camino termina en algo que puedes hacer hoy mismo, sin contratar nada."
        breadcrumb={[{ label: 'IA para todos' }]}
      />
      <ForEveryone />
      <KnowledgeSection limit={3} />
      <CtaBand
        title="¿Prefieres que te acompañemos?"
        text="Si después de leer sigues sin verlo claro, cuéntanoslo. Media hora de conversación suele bastar para ordenar el punto de partida."
      />
    </>
  )
}
