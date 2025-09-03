
const CACHE_NAME = 'mahyay-cache-v2';
// A more comprehensive list of files for better offline support.
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // Main application script
  '/vite.svg',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',

  // Core dependencies from CDN as specified in importmap
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1/client',
  'https://aistudiocdn.com/@google/genai@^1.16.0',
  'https://aistudiocdn.com/react-router-dom@^7.8.2',

  // Styling
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', event => {
  // Wait until the cache is opened and all fundamental assets are added.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If we find a response in the cache, return it
        if (response) {
          return response;
        }
        // Otherwise, fetch it from the network
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
