const CACHE_NAME = 'revynai-shell-v2';
const SHELL_ASSETS = ['/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/favicon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Network-first: la app es dinámica (dashboard con datos en vivo), el SW solo
// existe para cumplir el criterio de instalabilidad y servir el shell si la
// red falla — nunca debe mostrar datos de negocio obsoletos como si fueran actuales.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match('/manifest.webmanifest')))
  );
});
