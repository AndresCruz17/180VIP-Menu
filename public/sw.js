// 180 VIP Nightclub — High-Performance Service Worker
const CACHE_NAME = '180vip-cache-v1';

const PRECACHE_ASSETS = [
  '/',
  '/menu',
  '/eventos',
  '/reservas',
  '/comunidad',
  '/logo.png',
  '/logo.webp',
  '/Fondo_home.jpg',
  '/Fondo_home.webp',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache partial failure, ignoring:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // No interceptar rutas de admin o api para no romper llamadas de autenticacion
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) {
    return;
  }

  // Estrategia Network-First para navegacion HTML con respaldo offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return caches.match('/menu'); // Fallback por defecto a la carta
          });
        })
    );
    return;
  }

  // Estrategia Stale-While-Revalidate para imagenes y assets estaticos
  if (
    event.request.destination === 'image' ||
    event.request.destination === 'style' ||
    event.request.destination === 'script' ||
    event.request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        }).catch(() => null);

        return cached || fetchPromise;
      })
    );
  }
});
