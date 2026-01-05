// Service Worker para Portafolio de Aldair Dev
// Versión: 1.0.0
// Fecha: 2024-12-28

const CACHE_NAME = 'aldair-portfolio-v1.0';
const APP_SHELL_CACHE = 'aldair-portfolio-shell-v1.0';

// URLs críticas para la aplicación (App Shell)
const APP_SHELL_URLS = [
  './',
  './index.html',
  './src/styles/tailwind.css',
  './src/styles/style.css',
  './src/styles/fontawesome.min.css',
  './src/scripts/main.js',
  './src/scripts/carousel.js',
  './src/scripts/form.js',
  './public/img/foto_perfil.webp',
  './public/img/logo.ico',
  './public/docs/cv.pdf'
];

// URLs de recursos externos para cachear
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMNg.woff2',
  'https://kit.fontawesome.com/your-fontawesome-kit.js' // Reemplazar con tu kit real
];

// Tipos de archivos a cachear dinámicamente
const CACHEABLE_TYPES = [
  'text/html',
  'text/css',
  'application/javascript',
  'image/webp',
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'font/woff2',
  'application/pdf'
];

// ===== INSTALACIÓN =====
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cachear App Shell
      caches.open(APP_SHELL_CACHE)
        .then(cache => {
          console.log('[Service Worker] Cacheando App Shell...');
          return cache.addAll(APP_SHELL_URLS)
            .catch(error => {
              console.warn('[Service Worker] Error cacheando algunos recursos:', error);
            });
        }),
      
      // Cachear recursos externos
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('[Service Worker] Cacheando recursos externos...');
          return Promise.all(
            EXTERNAL_RESOURCES.map(url => {
              return fetch(url, { mode: 'no-cors' })
                .then(response => {
                  if (response.ok || response.type === 'opaque') {
                    return cache.put(url, response);
                  }
                })
                .catch(error => {
                  console.warn(`[Service Worker] Error cacheando ${url}:`, error);
                });
            })
          );
        })
    ]).then(() => {
      console.log('[Service Worker] Instalación completada');
      return self.skipWaiting();
    })
  );
});

// ===== ACTIVACIÓN =====
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Eliminar caches antiguos que no coincidan con los actuales
          if (cacheName !== CACHE_NAME && cacheName !== APP_SHELL_CACHE) {
            console.log('[Service Worker] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activación completada');
      return self.clients.claim();
    })
  );
});

// ===== ESTRATEGIAS DE CACHE =====

// Estrategia: Cache First para recursos estáticos
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('[Service Worker] Sirviendo desde cache:', request.url);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Verificar si debemos cachear esta respuesta
    if (shouldCache(request, networkResponse)) {
      const cache = await caches.open(CACHE_NAME);
      console.log('[Service Worker] Cacheando nuevo recurso:', request.url);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Error de red:', error);
    
    // Fallback para HTML
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match('./');
    }
    
    // Fallback para imágenes
    if (request.headers.get('Accept').includes('image')) {
      const fallbackImage = await caches.match('./public/img/logo.ico');
      if (fallbackImage) return fallbackImage;
    }
    
    // Fallback para CSS/JS
    if (request.url.includes('.css') || request.url.includes('.js')) {
      const fallback = await caches.match(request.url);
      if (fallback) return fallback;
    }
    
    // Devolver una respuesta de error
    return new Response('No hay conexión a internet', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// Estrategia: Network First para datos dinámicos
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cachear respuestas exitosas
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Red falló, usando cache:', request.url);
    const cachedResponse = await caches.match(request);
    return cachedResponse || Response.error();
  }
}

// Estrategia: Stale While Revalidate (para recursos que pueden actualizarse)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Devolver respuesta cacheada inmediatamente
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    // Actualizar cache si la respuesta es válida
    if (shouldCache(request, networkResponse)) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Silenciar errores de red
    console.log('[Service Worker] Error al actualizar cache para:', request.url);
  });
  
  // Enviar la solicitud de red en segundo plano
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC',
        url: request.url
      });
    });
  });
  
  return cachedResponse || fetchPromise;
}

// ===== MANEJADOR FETCH PRINCIPAL =====
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorar solicitudes que no son GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Excepciones específicas
  if (shouldIgnoreRequest(event.request)) {
    return;
  }
  
  // Seleccionar estrategia basada en el tipo de recurso
  let strategy;
  
  if (isAppShellRequest(event.request)) {
    // App Shell: Cache First (más rápido)
    strategy = cacheFirst;
  } else if (isDynamicRequest(event.request)) {
    // Datos dinámicos: Network First
    strategy = networkFirst;
  } else if (isCacheableAsset(event.request)) {
    // Assets estáticos: Stale While Revalidate
    strategy = staleWhileRevalidate;
  } else {
    // Por defecto: Cache First
    strategy = cacheFirst;
  }
  
  event.respondWith(strategy(event.request));
});

// ===== FUNCIONES DE UTILIDAD =====

function shouldIgnoreRequest(request) {
  const url = request.url;
  
  // Ignorar solicitudes de Formspree (formularios)
  if (url.includes('formspree.io')) {
    console.log('[Service Worker] Ignorando solicitud de formulario:', url);
    return true;
  }
  
  // Ignorar solicitudes de analytics
  if (url.includes('google-analytics') || url.includes('gtag')) {
    return true;
  }
  
  // Ignorar solicitudes de video/audio grandes
  if (url.includes('.mp4') || url.includes('.mp3') || url.includes('.avi')) {
    return true;
  }
  
  return false;
}

function shouldCache(request, response) {
  // Solo cachear respuestas exitosas
  if (!response || !response.ok) {
    return false;
  }
  
  // Solo cachear del mismo origen
  const url = new URL(request.url);
  if (url.origin !== self.location.origin && 
      !url.href.includes('fonts.googleapis.com') &&
      !url.href.includes('fonts.gstatic.com')) {
    return false;
  }
  
  // Verificar tipo de contenido
  const contentType = response.headers.get('Content-Type');
  if (!contentType) return false;
  
  return CACHEABLE_TYPES.some(type => contentType.includes(type));
}

function isAppShellRequest(request) {
  const url = request.url;
  const pathname = new URL(url).pathname;
  
  const appShellPaths = [
    '/',
    '/index.html',
    '/src/styles/',
    '/src/scripts/main.js',
    '/src/scripts/carousel.js',
    '/src/scripts/form.js',
    '/public/img/foto_perfil.webp',
    '/public/img/logo.ico'
  ];
  
  return appShellPaths.some(path => url.includes(path) || pathname === path);
}

function isDynamicRequest(request) {
  const url = request.url;
  
  // Considerar dinámicas las solicitudes a APIs
  return url.includes('/api/') || 
         url.includes('?') || // URLs con query params
         url.includes('.php') ||
         url.includes('.json');
}

function isCacheableAsset(request) {
  const url = request.url;
  const extension = url.split('.').pop().toLowerCase();
  
  const cacheableExtensions = [
    'css', 'js', 'webp', 'png', 'jpg', 'jpeg', 'svg', 'woff2', 'woff', 'ttf', 'ico', 'pdf'
  ];
  
  return cacheableExtensions.includes(extension);
}

// ===== MANEJADOR DE MENSAJES =====
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
    caches.delete(APP_SHELL_CACHE);
  }
  
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    caches.keys().then(cacheNames => {
      event.ports[0].postMessage({
        type: 'CACHE_INFO',
        caches: cacheNames
      });
    });
  }
});

// ===== MANEJADOR DE SINCRONIZACIÓN EN SEGUNDO PLANO =====
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sincronización en segundo plano:', event.tag);
  
  if (event.tag === 'update-cache') {
    event.waitUntil(updateCache());
  }
});

async function updateCache() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  
  const updatePromises = requests.map(async request => {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        await cache.put(request, networkResponse.clone());
        console.log('[Service Worker] Actualizado:', request.url);
      }
    } catch (error) {
      console.log('[Service Worker] Error actualizando:', request.url, error);
    }
  });
  
  await Promise.all(updatePromises);
}

// ===== MANEJADOR DE NOTIFICACIONES PUSH =====
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Notificación push recibida');
  
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Nueva actualización disponible',
    icon: './public/img/logo.ico',
    badge: './public/img/logo.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || './'
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Aldair Dev', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificación clickeada:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url)
    );
  }
});

// ===== HEALTH CHECK =====
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'health-check') {
    console.log('[Service Worker] Realizando health check...');
    event.waitUntil(healthCheck());
  }
});

async function healthCheck() {
  try {
    const response = await fetch('./', { cache: 'no-store' });
    if (response.ok) {
      console.log('[Service Worker] Health check: OK');
      return true;
    }
  } catch (error) {
    console.error('[Service Worker] Health check falló:', error);
  }
  return false;
}

// ===== MANEJADOR DE ERRORES GLOBAL =====
self.addEventListener('error', (event) => {
  console.error('[Service Worker] Error global:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[Service Worker] Promesa rechazada no manejada:', event.reason);
});

console.log('[Service Worker] Cargado y listo');
