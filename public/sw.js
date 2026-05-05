self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response.status === 200 && event.request.method === 'GET') {
          const cache = caches.open('video-parser-v1');
          cache.then((c) => c.put(event.request, response.clone()));
        }
        return response;
      });
    })
  );
});
