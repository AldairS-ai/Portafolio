// Service Worker para Portafolio de Aldair Dev
// Versión: 1.1.0
// Fecha: 2024-12-28
// Tiempos de caché optimizados para mejor performance

const APP_VERSION = '1.1.0';
const BUILD_TIMESTAMP = '20241228';

// Nombres de caché
const CACHE_NAME = `aldair-portfolio-v${APP_VERSION}`;
const APP_SHELL_CACHE = `aldair-portfolio-shell-v${APP_VERSION}`;

// Políticas de caché por tipo de recurso
const CACHE_POLICIES = {
  'html': { strategy: 'networkFirst', maxAge: 3600 }, // 1 hora
  'css': { strategy: 'cacheFirst', maxAge: 31536000 }, // 1 año
  'js': { strategy: 'cacheFirst', maxAge: 31536000 }, // 1 año
  'image': { strategy: 'cacheFirst', maxAge: 31536000 }, // 1 año
  'font': { strategy: 'cacheFirst', maxAge: 31536000 }, // 1 año
  'pdf': { strategy: 'cacheFirst', maxAge: 31536000 } // 1 año
};

// URLs críticas para la aplicación (App Shell) con versión
const APP_SHELL_URLS = [
  './',
  './index.html',
  './src/styles/tailwind.css',
  './src/styles/style.css',
  './src/styles/fontawesome.min.css',
  './src/scripts/main.js',
  './src/scripts/carousel.js',
  './src/scripts/form.js',
  './src/scripts/app.js',
  './public/img/foto_perfil.webp',
  './public/img/logo.ico',
  './public/docs/cv.pdf'
].map(url => `${url}?v=${APP_VERSION}`);

// URLs de recursos externos para cachear
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMNg.woff2'
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
  console.log(`[Service Worker ${APP_VERSION}] Instalando...`);
  
  event.waitUntil(
    Promise.all([
      // Cachear App Shell
      caches.open(APP_SHELL_CACHE)
        .then(cache => {
          console.log('[Service Worker] Cacheando App Shell...');
          return cache.addAll(APP_SHELL_URLS)
            .then(() => {
              console.log('[Service Worker] App Shell cacheado exitosamente');
            })
            .catch(error => {
              console.warn('[Service Worker] Error cacheando algunos recursos:', error);
              // Continuar aunque falle algunos recursos
            });
        }),
      
      // Cachear recursos externos (no críticos)
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
                  return Promise.resolve();
                })
                .catch(error => {
                  console.warn(`[Service Worker] Error cacheando ${url}:`, error);
                  return Promise.resolve();
                });
            })
          );
        })
    ]).then(() => {
      console.log(`[Service Worker ${APP_VERSION}] Instalación completada`);
      return self.skipWaiting();
    })
  );
});

// ===== ACTIVACIÓN =====
self.addEventListener('activate', (event) => {
  console.log(`[Service Worker ${APP_VERSION}] Activando...`);
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Eliminar caches antiguos que no coincidan con los actuales
          if (!cacheName.includes(APP_VERSION) && 
              (cacheName.startsWith('aldair-portfolio') || 
               cacheName.startsWith('aldair-portfolio-shell'))) {
            console.log('[Service Worker] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log(`[Service Worker ${APP_VERSION}] Activación completada`);
      return self.clients.claim();
    })
  );
});

// ===== ESTRATEGIAS DE CACHE =====

// Función para determinar política de caché según tipo de recurso
function getCachePolicy(request) {
  const url = request.url;
  
  // Verificar si es un recurso de la aplicación
  if (url.includes(location.origin)) {
    if (url.endsWith('.html') || url === location.origin + '/' || url.includes('index.html')) {
      return CACHE_POLICIES.html;
    } else if (url.endsWith('.css')) {
      return CACHE_POLICIES.css;
    } else if (url.endsWith('.js')) {
      return CACHE_POLICIES.js;
    } else if (url.match(/\.(webp|png|jpg|jpeg|gif|ico|svg)$/i)) {
      return CACHE_POLICIES.image;
    } else if (url.match(/\.(woff2|woff|ttf|eot)$/i)) {
      return CACHE_POLICIES.font;
    } else if (url.endsWith('.pdf')) {
      return CACHE_POLICIES.pdf;
    }
  }
  
  // Recursos externos
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    return CACHE_POLICIES.font;
  }
  
  // Por defecto
  return CACHE_POLICIES.html;
}

// Estrategia: Cache First para recursos estáticos
async function cacheFirst(request) {
  const cachePolicy = getCachePolicy(request);
  
  // Verificar si el recurso debe ser cachead
  if (!shouldCacheRequest(request)) {
    return fetch(request);
  }
  
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('[Service Worker] Sirviendo desde cache:', request.url);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Verificar si debemos cachear esta respuesta
    if (shouldCacheResponse(request, networkResponse)) {
      const cache = await caches.open(CACHE_NAME);
      console.log('[Service Worker] Cacheando nuevo recurso:', request.url);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Error de red:', error);
    
    // Fallbacks específicos
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match('./?v=' + APP_VERSION);
    }
    
    if (request.headers.get('Accept').includes('image')) {
      const fallbackImage = await caches.match('./public/img/logo.ico?v=' + APP_VERSION);
      if (fallbackImage) return fallbackImage;
    }
    
    if (request.url.includes('.css') || request.url.includes('.js')) {
      const fallback = await caches.match(request.url);
      if (fallback) return fallback;
    }
    
    // Devolver una respuesta de error amigable
    return new Response(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sin conexión</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 2rem; text-align: center; }
          .offline { color: #666; margin-top: 2rem; }
          .retry { margin-top: 1rem; }
        </style>
      </head>
      <body>
        <h1>⚠️ Sin conexión a internet</h1>
        <p>No se puede cargar la página. Por favor, verifica tu conexión.</p>
        <div class="retry">
          <button onclick="location.reload()">Reintentar</button>
        </div>
      </body>
      </html>
    `, {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/html'
      })
    });
  }
}

// Estrategia: Network First para datos dinámicos
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cachear respuestas exitosas
    if (networkResponse.ok && shouldCacheResponse(request, networkResponse)) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Red falló, usando cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Devolver respuesta de error
    return new Response('No hay conexión y no hay caché disponible', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Estrategia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Iniciar fetch en segundo plano para actualizar caché
  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (shouldCacheResponse(request, networkResponse)) {
        await cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(error => {
      console.log('[Service Worker] Error actualizando cache:', error);
      // Silenciar error, mantener caché antiguo
    });
  
  // Devolver caché inmediatamente si existe
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Si no hay caché, esperar la respuesta de red
  return fetchPromise;
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
  const cachePolicy = getCachePolicy(event.request);
  let strategy;
  
  switch (cachePolicy.strategy) {
    case 'networkFirst':
      strategy = networkFirst;
      break;
    case 'staleWhileRevalidate':
      strategy = staleWhileRevalidate;
      break;
    case 'cacheFirst':
    default:
      strategy = cacheFirst;
      break;
  }
  
  event.respondWith(strategy(event.request));
});

// ===== FUNCIONES DE UTILIDAD =====

function shouldIgnoreRequest(request) {
  const url = request.url;
  
  // Ignorar solicitudes de Formspree (formularios dinámicos)
  if (url.includes('formspree.io')) {
    return true;
  }
  
  // Ignorar solicitudes de analytics
  if (url.includes('google-analytics') || url.includes('gtag') || url.includes('analytics')) {
    return true;
  }
  
  // Ignorar solicitudes de video/audio grandes
  if (url.match(/\.(mp4|mp3|avi|mov|wmv|flv|mkv)$/i)) {
    return true;
  }
  
  return false;
}

function shouldCacheRequest(request) {
  const url = request.url;
  
  // No cachear solicitudes POST, PUT, DELETE, etc.
  if (request.method !== 'GET') {
    return false;
  }
  
  // No cachear solicitudes con parámetros dinámicos (excepto versionado)
  if (url.includes('?') && !url.includes('?v=')) {
    return false;
  }
  
  return true;
}

function shouldCacheResponse(request, response) {
  // Solo cachear respuestas exitosas
  if (!response || !response.ok) {
    return false;
  }
  
  // Solo cachear respuestas del mismo origen o fuentes confiables
  const url = new URL(request.url);
  const allowedOrigins = [
    self.location.origin,
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdnjs.cloudflare.com'
  ];
  
  if (!allowedOrigins.some(origin => url.origin === origin)) {
    return false;
  }
  
  // Verificar tipo de contenido
  const contentType = response.headers.get('Content-Type');
  if (!contentType) return false;
  
  return CACHEABLE_TYPES.some(type => contentType.includes(type));
}

// ===== MANEJADOR DE MENSAJES =====
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
      });
    });
  }
  
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    caches.keys().then(cacheNames => {
      event.ports[0].postMessage({
        type: 'CACHE_INFO',
        version: APP_VERSION,
        caches: cacheNames
      });
    });
  }
  
  if (event.data && event.data.type === 'UPDATE_CACHE') {
    updateCache();
  }
});

// ===== FUNCIONES DE MANTENIMIENTO =====

async function updateCache() {
  console.log('[Service Worker] Actualizando caché...');
  
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  
  const updatePromises = requests.map(async request => {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok && shouldCacheResponse(request, networkResponse)) {
        await cache.put(request, networkResponse.clone());
        console.log('[Service Worker] Actualizado:', request.url);
      }
    } catch (error) {
      console.log('[Service Worker] Error actualizando:', request.url);
    }
  });
  
  await Promise.all(updatePromises);
  console.log('[Service Worker] Actualización de caché completada');
}

// ===== NOTIFICACIONES PUSH =====
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Notificación push recibida');
  
  if (!event.data) return;
  
  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'Aldair Dev',
      body: event.data.text() || 'Nueva actualización disponible'
    };
  }
  
  const options = {
    body: data.body || 'Nueva actualización en el portafolio',
    icon: './public/img/logo.ico?v=' + APP_VERSION,
    badge: './public/img/logo.ico?v=' + APP_VERSION,
    vibrate: [100, 50, 100],
    data: {
      url: data.url || './',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'dismiss',
        title: 'Cerrar'
      }
    ],
    tag: 'portfolio-update',
    renotify: true,
    requireInteraction: false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Aldair Dev', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificación clickeada:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || event.action === '') {
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(windowClients => {
        // Buscar ventana existente
        for (const client of windowClients) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Abrir nueva ventana si no existe
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});

// ===== SINCRONIZACIÓN EN SEGUNDO PLANO =====
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sincronización en segundo plano:', event.tag);
  
  if (event.tag === 'update-resources') {
    event.waitUntil(updateCache());
  }
  
  if (event.tag === 'health-check') {
    event.waitUntil(healthCheck());
  }
});

async function healthCheck() {
  try {
    const response = await fetch('./?v=' + APP_VERSION, { 
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (response.ok) {
      console.log('[Service Worker] Health check: OK');
      
      // Enviar mensaje a todos los clients
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'HEALTH_CHECK',
          status: 'healthy',
          timestamp: Date.now()
        });
      });
      
      return true;
    }
  } catch (error) {
    console.error('[Service Worker] Health check falló:', error);
    
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'HEALTH_CHECK',
        status: 'unhealthy',
        error: error.message,
        timestamp: Date.now()
      });
    });
  }
  return false;
}

// ===== MANEJADOR DE ERRORES =====
self.addEventListener('error', (event) => {
  console.error('[Service Worker] Error global:', event.error);
  
  // Reportar error a los clients
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SERVICE_WORKER_ERROR',
        error: event.error ? event.error.toString() : 'Error desconocido',
        timestamp: Date.now()
      });
    });
  });
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[Service Worker] Promesa rechazada no manejada:', event.reason);
});

// ===== PERIODIC SYNC =====
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    console.log('[Service Worker] Limpieza periódica de caché');
    event.waitUntil(cleanupOldCaches());
  }
});

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = [CACHE_NAME, APP_SHELL_CACHE];
  
  return Promise.all(
    cacheNames.map(cacheName => {
      if (!currentCaches.includes(cacheName) && 
          cacheName.startsWith('aldair-portfolio')) {
        console.log('[Service Worker] Eliminando caché antiguo:', cacheName);
        return caches.delete(cacheName);
      }
    })
  );
}

// ===== REGISTRO INICIAL =====
console.log(`[Service Worker ${APP_VERSION}] Cargado y listo`);
console.log(`[Service Worker] Build: ${BUILD_TIMESTAMP}`);

// Función para verificar estado
self.getStatus = function() {
  return {
    version: APP_VERSION,
    build: BUILD_TIMESTAMP,
    cachePolicy: 'optimized',
    strategies: CACHE_POLICIES,
    timestamp: Date.now()
  };
};

// Exportar para pruebas
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CACHE_POLICIES,
    getCachePolicy,
    shouldCacheResponse,
    shouldIgnoreRequest
  };
}
