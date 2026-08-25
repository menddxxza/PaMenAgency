/**
 * Genera `dist/sitemap.xml` después del build.
 *
 * Las rutas dinámicas (servicios y documentos del centro de conocimiento) se
 * extraen de los propios archivos de contenido, de modo que añadir un servicio
 * o una guía basta para que aparezca en el sitemap sin tocar este script.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

// Debe coincidir con `site.url` en src/content/site.ts.
const BASE = 'https://pamenagency.com'

/** Rutas fijas, con la prioridad relativa que les corresponde. */
const staticRoutes = [
  ['/', 1.0, 'weekly'],
  ['/nosotros', 0.8, 'monthly'],
  ['/servicios', 0.9, 'monthly'],
  ['/ia-para-todos', 0.8, 'monthly'],
  ['/conocimiento', 0.9, 'weekly'],
  ['/grietas-de-la-ia', 0.8, 'monthly'],
  ['/metodologia', 0.7, 'monthly'],
  ['/diagnostico', 0.8, 'monthly'],
  ['/faq', 0.7, 'monthly'],
  ['/contacto', 0.7, 'yearly'],
]

const slugsFrom = (source) => [...source.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1])

async function collect() {
  const services = slugsFrom(await readFile(join(root, 'src/content/services.ts'), 'utf8'))

  const knowledgeDir = join(root, 'src/content/knowledge')
  const files = (await readdir(knowledgeDir)).filter(
    (f) => f.endsWith('.ts') && !['index.ts', 'types.ts'].includes(f),
  )
  const docs = []
  for (const file of files) {
    docs.push(...slugsFrom(await readFile(join(knowledgeDir, file), 'utf8')))
  }

  return { services, docs }
}

const urlEntry = (path, priority, changefreq, lastmod) =>
  [
    '  <url>',
    `    <loc>${BASE}${path}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority.toFixed(1)}</priority>`,
    '  </url>',
  ].join('\n')

const { services, docs } = await collect()
const today = new Date().toISOString().slice(0, 10)

const entries = [
  ...staticRoutes.map(([path, p, freq]) => urlEntry(path, p, freq, today)),
  ...services.map((slug) => urlEntry(`/servicios/${slug}`, 0.7, 'monthly', today)),
  ...docs.map((slug) => urlEntry(`/conocimiento/${slug}`, 0.8, 'monthly', today)),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`

if (!existsSync(dist)) {
  console.error('No existe dist/. Ejecuta el build antes de generar el sitemap.')
  process.exit(1)
}

await writeFile(join(dist, 'sitemap.xml'), xml, 'utf8')
console.log(
  `sitemap.xml generado con ${entries.length} URLs ` +
    `(${staticRoutes.length} fijas, ${services.length} servicios, ${docs.length} guías).`,
)
