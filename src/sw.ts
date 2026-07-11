/// <reference lib="webworker" />
// Placeholder — reemplazar por la lógica del service-worker.js original en
// cuanto se comparta. `self.__WB_MANIFEST` es el punto donde vite-plugin-pwa
// (injectManifest) inyecta la lista de assets a precachear; workbox-build
// busca ese literal en el código fuente, así que no se puede renombrar.

export {}

interface PrecacheEntry {
  url: string
  revision: string | null
}

declare global {
  interface WorkerGlobalScope {
    __WB_MANIFEST: (string | PrecacheEntry)[]
  }
}

const sw = self as unknown as ServiceWorkerGlobalScope

const CACHE_NAME = 'atiende-cache-v1'
const PRECACHE_MANIFEST = self.__WB_MANIFEST

sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_MANIFEST.map((entry) => (typeof entry === 'string' ? entry : entry.url))),
    ),
  )
  sw.skipWaiting()
})

sw.addEventListener('activate', (event) => {
  event.waitUntil(sw.clients.claim())
})

sw.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached ?? fetch(event.request)),
  )
})
