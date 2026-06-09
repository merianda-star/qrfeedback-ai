const CACHE_NAME = 'qrfeedback-v2';
const STATIC_ASSETS = ['/logo.png', '/favicon.ico', '/android-chrome-192x192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Let these pass through to network untouched — never intercept them
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/feedback/') ||
    url.pathname.startsWith('/_next/') ||
    url.origin !== self.location.origin
  ) return;

  // For static assets: try cache first, fallback to network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Only cache valid responses for static assets
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Return a fallback for navigations if completely offline
      if (event.request.mode === 'navigate') {
        return caches.match('/') || new Response('Offline', { status: 503 });
      }
    })
  );
});