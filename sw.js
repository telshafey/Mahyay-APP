const CACHE_NAME = 'mahyay-cache-v1';
// أضف هنا الملفات الأساسية التي تريد تخزينها مؤقتاً
const urlsToCache = [
  '/',
  '/index.html',
  // يمكنك إضافة المزيد من الأصول الثابتة هنا مثل CSS و JS
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', event => {
  // انتظر حتى يتم فتح ذاكرة التخزين المؤقت وإضافة الملفات إليها
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
        // إذا وجدنا استجابة في ذاكرة التخزين المؤقت، نرجعها
        if (response) {
          return response;
        }
        // وإلا، نطلبها من الشبكة
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
          // حذف ذاكرات التخزين المؤقت القديمة
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
