import { useEffect } from 'react'
import { site } from '@/content/site'

type SeoOptions = {
  title: string
  description: string
  /** Ruta relativa, p. ej. `/servicios`. Se usa para canonical y og:url. */
  path: string
  /** Datos estructurados schema.org. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
  /** `noindex` para páginas que no deben aparecer en buscadores. */
  noindex?: boolean
  type?: 'website' | 'article'
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  return el
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

/**
 * Gestiona las etiquetas de cabecera de cada página.
 *
 * El sitio se renderiza en cliente, así que los metadatos se escriben al
 * montar la ruta. El `index.html` incluye ya un juego por defecto para que
 * un rastreador que no ejecute JavaScript no encuentre la cabecera vacía.
 */
export function useSeo({ title, description, path, jsonLd, noindex, type = 'website' }: SeoOptions) {
  useEffect(() => {
    const fullTitle = path === '/' ? `${site.name} — ${site.tagline}` : `${title} · ${site.name}`
    const url = `${site.url}${path === '/' ? '' : path}`
    const image = `${site.url}/og-image.png`

    document.title = fullTitle
    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noindex ? 'noindex, follow' : 'index, follow',
    })
    upsertLink('canonical', url)

    const og: Record<string, string> = {
      'og:title': fullTitle,
      'og:description': description,
      'og:url': url,
      'og:type': type,
      'og:site_name': site.name,
      'og:locale': site.locale,
      'og:image': image,
    }
    for (const [property, content] of Object.entries(og)) {
      upsertMeta(`meta[property="${property}"]`, { property, content })
    }

    const tw: Record<string, string> = {
      'twitter:card': 'summary_large_image',
      'twitter:title': fullTitle,
      'twitter:description': description,
      'twitter:image': image,
    }
    for (const [name, content] of Object.entries(tw)) {
      upsertMeta(`meta[name="${name}"]`, { name, content })
    }

    // Los datos estructurados de la página se reemplazan en cada navegación.
    const prev = document.getElementById('pm-jsonld')
    if (prev) prev.remove()
    if (jsonLd) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = 'pm-jsonld'
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
    // `jsonLd` se serializa para evitar re-ejecuciones por identidad de objeto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, noindex, type, JSON.stringify(jsonLd ?? null)])
}

/** Datos estructurados de la organización, comunes a todo el sitio. */
export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${site.url}/#organization`,
  name: site.name,
  alternateName: 'PaMen Agency',
  description: site.description,
  url: site.url,
  email: site.email,
  logo: `${site.url}/logo.jpg`,
  image: `${site.url}/logo.jpg`,
  areaServed: 'ES',
  availableLanguage: 'es',
  slogan: site.tagline,
  sameAs: site.social.filter((s) => s.url).map((s) => s.url as string),
  knowsAbout: [
    'Inteligencia artificial',
    'Automatización de procesos',
    'Consultoría de IA',
    'Integración de sistemas',
    'Formación en inteligencia artificial',
  ],
}

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: `${site.url}${item.path === '/' ? '' : item.path}`,
  })),
})
