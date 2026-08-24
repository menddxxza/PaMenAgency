// Service worker mínimo: solo habilita la instalación como app de escritorio/móvil.
// No cachea nada — los datos de búsqueda y la sesión son dinámicos, así que
// cachear aquí solo arriesgaría servir resultados o estado de auth obsoletos.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Pass-through explícito: deja que el navegador resuelva la petición normalmente.
});
