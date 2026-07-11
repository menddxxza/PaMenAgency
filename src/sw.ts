/// <reference lib="webworker" />
// Reemplazar por la lógica del service-worker.js original si difiere una vez
// se comparta. Estrategia: precache del app shell (inyectado por
// vite-plugin-pwa vía self.__WB_MANIFEST — workbox-build busca ese literal
// en el código fuente, así que no se puede renombrar), network-first para
// navegación (con fallback a caché y a /offline.html), cache-first para
// assets estáticos. Las llamadas a Supabase (cross-origin) no se
// interceptan: necesitan ir siempre a red para auth/datos en vivo.

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
const OFFLINE_URL = '/offline.html'
const PRECACHE_URLS = self.__WB_MANIFEST.map((entry) => (typeof entry === 'string' ? entry : entry.url))

sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([...PRECACHE_URLS, OFFLINE_URL])),
  )
  sw.skipWaiting()
})

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => sw.clients.claim()),
  )
})

sw.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  if (new URL(request.url).origin !== sw.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(async () => (await caches.match(request)) ?? (await caches.match(OFFLINE_URL)) ?? Response.error()),
    )
    return
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        }),
    ),
  )
})
