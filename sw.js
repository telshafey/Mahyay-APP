
import { precacheAndRoute } from 'workbox-precaching';

// The __WB_MANIFEST is a placeholder that will be replaced by the
// Vite PWA plugin with a list of assets to precache.
precacheAndRoute(self.__WB_MANIFEST);

// Make sure the new service worker activates immediately.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png'
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});