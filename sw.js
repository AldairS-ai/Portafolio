const CACHE_NAME = 'portafolio-v4';
const FILES_TO_CACHE = [
  '/Portafolio/',
  '/Portafolio/index.html',
  '/Portafolio/styles.min.css',
  '/Portafolio/app.min.js',
  '/Portafolio/manifest.json',
  '/Portafolio/icons/icon-192.png',
  '/Portafolio/icons/icon-512.png'
];

self.addEventListener('install', event => {
  console.log('🟡 Service Worker instalándose...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('🟡 Cache abierto, añadiendo archivos críticos...');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        console.log('✅ Archivos críticos cacheados');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Error durante la instalación:', error);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('🟡 Service Worker activándose...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Eliminando cache viejo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activado');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/Portafolio/index.html');
            }
          });
      })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});