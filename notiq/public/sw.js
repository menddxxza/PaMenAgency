// Service worker de Notiq — solo para notificaciones push (no cachea nada, no
// convierte la app en offline-first: eso es un proyecto aparte). Vive en
// public/ para poder registrarse con el scope "/" (la raíz del dominio), que
// es donde el navegador exige que esté un service worker para poder cubrir
// toda la app.

self.addEventListener('push', (evento) => {
  if (!evento.data) return;

  let datos;
  try {
    datos = evento.data.json();
  } catch {
    return;
  }

  evento.waitUntil(
    self.registration.showNotification(datos.titulo || 'Notiq', {
      body: datos.cuerpo || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: datos.url || '/tareas' },
    }),
  );
});

// Al hacer clic en la notificación, lleva a la pestaña de Notiq ya abierta si
// hay una (y la enfoca) en vez de abrir una nueva siempre.
self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();
  const destino = evento.notification.data?.url || '/tareas';

  evento.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((listaClientes) => {
      for (const cliente of listaClientes) {
        if ('focus' in cliente) {
          cliente.navigate(destino);
          return cliente.focus();
        }
      }
      return self.clients.openWindow(destino);
    }),
  );
});
