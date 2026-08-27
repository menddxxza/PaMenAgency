import { Hero } from '@/components/sections/Hero'
import { Problem } from '@/components/sections/Problem'
import { About } from '@/components/sections/About'
import { Advantage } from '@/components/sections/Advantage'
import { ProductsSection } from '@/components/sections/ProductsSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { MethodologySection } from '@/components/sections/MethodologySection'
import { ForEveryone } from '@/components/sections/ForEveryone'
import { KnowledgeSection } from '@/components/sections/KnowledgeSection'
import { CracksSection } from '@/components/sections/CracksSection'
import { UseCasesSection } from '@/components/sections/UseCasesSection'
import { DiagnosticSection } from '@/components/sections/DiagnosticSection'
import { FaqSection } from '@/components/sections/FaqSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { organizationJsonLd, useSeo } from '@/lib/seo'
import { faqs } from '@/content/faq'
import { site } from '@/content/site'

/**
 * Portada. El orden de las secciones es deliberado: primero el problema,
 * después quiénes somos, y sólo entonces lo que vendemos. La web demuestra
 * conocimiento antes de pedir nada.
 */
export default function Home() {
  useSeo({
    title: 'Inicio',
    description: site.description,
    path: '/',
    jsonLd: [
      organizationJsonLd,
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.slice(0, 8).map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a.join(' ') },
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: site.name,
        url: site.url,
        inLanguage: 'es-ES',
      },
    ],
  })

  return (
    <>
      <Hero />
      <Problem />
      <About />
      <Advantage />
      <ProductsSection />
      <ServicesSection limit={6} />
      <MethodologySection compact />
      <ForEveryone limit={3} />
      <KnowledgeSection limit={3} />
      <CracksSection limit={6} />
      <UseCasesSection />
      <DiagnosticSection />
      <FaqSection limit={8} />
      <ContactSection />
    </>
  )
}
