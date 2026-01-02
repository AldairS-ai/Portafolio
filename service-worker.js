// Caché simple para offline
const CACHE_NAME = 'portfolio-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/src/styles/tailwind.css',
  '/src/styles/style.css',
  '/src/styles/fontawesome.min.css',
  '/src/scripts/main.js',
  '/src/scripts/carousel.js',
  '/src/scripts/form.js',
  '/public/img/foto_perfil.webp',
  '/public/img/logo.ico',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMNg.woff2'

];

// Instalación: cachear recursos estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activación: limpiar caches antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia: Cache First, fallback a Network
self.addEventListener('fetch', event => {
  // No cachear formularios ni peticiones a Formspree
  if (event.request.url.includes('formspree.io') || 
      event.request.method === 'POST') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            // Solo cachear respuestas exitosas y que sean del mismo origen
            if (!response || response.status !== 200 || 
                response.type !== 'basic' ||
                !event.request.url.startsWith(self.location.origin)) {
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
            // Fallback para HTML
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/');
            }
            // Fallback para imágenes
            if (event.request.headers.get('accept').includes('image')) {
              return caches.match('/public/img/logo.ico');
            }
          });
      })
  );
});