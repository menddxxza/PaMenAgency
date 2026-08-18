import { PageHead } from '@/components/ui/PageHead'
import { ContactSection } from '@/components/sections/ContactSection'
import { FaqSection } from '@/components/sections/FaqSection'
import { breadcrumbJsonLd, organizationJsonLd, useSeo } from '@/lib/seo'

export default function Contacto() {
  useSeo({
    title: 'Contacto',
    description:
      'Cuéntanos tu situación y te decimos qué haríamos, en qué orden y qué descartaríamos. Si no necesitas contratar nada, también te lo diremos.',
    path: '/contacto',
    jsonLd: [
      organizationJsonLd,
      breadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Contacto', path: '/contacto' },
      ]),
    ],
  })

  return (
    <>
      <PageHead
        eyebrow="Contacto"
        title="¿Y si empezamos?"
        lead="No hace falta que traigas nada preparado ni que sepas qué necesitas. Con que nos cuentes cómo es tu semana, sobra para empezar."
        breadcrumb={[{ label: 'Contacto' }]}
      />
      <ContactSection />
      <FaqSection limit={6} />
    </>
  )
}
