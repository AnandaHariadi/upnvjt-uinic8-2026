// PACUL Push Notification Service Worker
// This file handles Web Push events and notification clicks.

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'PACUL', body: event.data.text(), url: '/dashboard' };
  }

  const options = {
    body: data.body ?? '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    image: data.image ?? undefined,
    data: { url: data.url ?? '/dashboard' },
    actions: data.actions ?? [],
    vibrate: [200, 100, 200],
    tag: data.tag ?? 'pacul-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'PACUL', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
