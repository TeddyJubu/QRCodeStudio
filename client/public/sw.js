/**
 * QR Code Studio Service Worker
 * Provides offline caching and performance optimization
 */

const CACHE_NAME = 'qr-code-studio-v1';
const STATIC_CACHE_NAME = 'qr-code-studio-static-v1';
const DYNAMIC_CACHE_NAME = 'qr-code-studio-dynamic-v1';
const QR_CACHE_NAME = 'qr-code-studio-qr-v1';

// Cache URLs - static assets that should be cached long-term
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/assets/index-*.css',
  '/assets/index-*.js',
  '/assets/react-core-*.js',
  '/assets/radix-ui-*.js',
  '/assets/ui-components-*.js',
  '/assets/vendor-*.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2',
  'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7.woff2',
  'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa3ZL7.woff2',
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  CACHE_ONLY: 'cache-only',
  NETWORK_ONLY: 'network-only',
};

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[Service Worker] Static assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== QR_CACHE_NAME
            ) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Old caches cleaned up');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with different strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Skip API requests and WebSocket connections
  if (url.pathname.startsWith('/api/') || url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }

  // Determine cache strategy based on request type
  const strategy = getCacheStrategy(request, url);

  event.respondWith(handleRequest(request, strategy));
});

// Determine cache strategy based on request type
function getCacheStrategy(request, url) {
  // Static assets - cache first
  if (isStaticAsset(request, url)) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }

  // QR code generation requests - network first with cache fallback
  if (url.pathname.includes('/qr/') || url.searchParams.has('qr')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }

  // API responses - network only
  if (url.pathname.startsWith('/api/')) {
    return CACHE_STRATEGIES.NETWORK_ONLY;
  }

  // Dynamic content - stale while revalidate
  if (url.pathname === '/' || url.pathname.includes('/index.html')) {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }

  // Default - network first
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

// Check if request is for a static asset
function isStaticAsset(request, url) {
  const staticExtensions = [
    '.css',
    '.js',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
  ];
  const isStaticFile = staticExtensions.some(ext => url.pathname.endsWith(ext));
  const isFont =
    url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');
  const isCDN = url.hostname.includes('cdn.jsdelivr.net') || url.hostname.includes('unpkg.com');

  return isStaticFile || isFont || isCDN;
}

// Handle request with appropriate strategy
async function handleRequest(request, strategy) {
  const cacheKey = generateCacheKey(request);

  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cacheKey);

    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cacheKey);

    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cacheKey);

    case CACHE_STRATEGIES.CACHE_ONLY:
      return cacheOnly(request, cacheKey);

    case CACHE_STRATEGIES.NETWORK_ONLY:
    default:
      return networkOnly(request);
  }
}

// Cache First strategy
async function cacheFirst(request, cacheKey) {
  try {
    const cachedResponse = await caches.match(cacheKey);
    if (cachedResponse) {
      console.log('[Service Worker] Cache hit:', cacheKey);
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(cacheKey, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache first strategy failed:', error);
    throw error;
  }
}

// Network First strategy
async function networkFirst(request, cacheKey) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(cacheKey, networkResponse.clone());
      return networkResponse;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', cacheKey);
    const cachedResponse = await caches.match(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request, cacheKey) {
  const cachedResponse = await caches.match(cacheKey);

  // Fetch from network in background
  const fetchPromise = fetch(request)
    .then(async networkResponse => {
      if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        cache.put(cacheKey, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(error => {
      console.warn('[Service Worker] Background fetch failed:', error);
    });

  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // Otherwise wait for network response
  return fetchPromise;
}

// Cache Only strategy
async function cacheOnly(request, cacheKey) {
  const cachedResponse = await caches.match(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  throw new Error('No cached response available');
}

// Network Only strategy
async function networkOnly(request) {
  return fetch(request);
}

// Generate cache key for request
function generateCacheKey(request) {
  const url = new URL(request.url);

  // For QR code requests, include parameters in cache key
  if (url.pathname.includes('/qr/') || url.searchParams.has('qr')) {
    return request.url;
  }

  // For other requests, use URL without cache-busting parameters
  const cacheBustingParams = ['_', 'v', 'version', 't', 'time'];
  cacheBustingParams.forEach(param => {
    url.searchParams.delete(param);
  });

  return url.toString();
}

// Message event - handle communication from main thread
self.addEventListener('message', event => {
  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_QR_CODE':
      cacheQRCode(data);
      break;

    case 'CLEAR_CACHE':
      clearCache();
      break;

    case 'GET_CACHE_INFO':
      getCacheInfo().then(info => {
        event.ports[0].postMessage(info);
      });
      break;
  }
});

// Cache QR code data
async function cacheQRCode(data) {
  try {
    const cache = await caches.open(QR_CACHE_NAME);
    const cacheKey = `qr-${data.id || Date.now()}`;

    await cache.put(
      cacheKey,
      new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      })
    );

    console.log('[Service Worker] QR code cached:', cacheKey);
  } catch (error) {
    console.error('[Service Worker] Failed to cache QR code:', error);
  }
}

// Clear all caches
async function clearCache() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    console.log('[Service Worker] All caches cleared');
  } catch (error) {
    console.error('[Service Worker] Failed to clear caches:', error);
  }
}

// Get cache information
async function getCacheInfo() {
  try {
    const cacheNames = await caches.keys();
    const cacheInfo = {};

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      cacheInfo[cacheName] = {
        count: requests.length,
        size: await calculateCacheSize(requests),
      };
    }

    return cacheInfo;
  } catch (error) {
    console.error('[Service Worker] Failed to get cache info:', error);
    return {};
  }
}

// Calculate cache size
async function calculateCacheSize(requests) {
  let totalSize = 0;

  for (const request of requests) {
    try {
      const response = await caches.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    } catch (error) {
      console.warn('[Service Worker] Failed to calculate size for:', request.url);
    }
  }

  return totalSize;
}

// Handle background sync for offline functionality
self.addEventListener('sync', event => {
  console.log('[Service Worker] Background sync triggered:', event.tag);

  if (event.tag === 'sync-qr-codes') {
    event.waitUntil(syncQRCodes());
  }
});

// Sync QR codes when back online
async function syncQRCodes() {
  try {
    // Get cached QR codes that need to be synced
    const cache = await caches.open(QR_CACHE_NAME);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      const qrData = await response.json();

      if (qrData.needsSync) {
        try {
          // Sync with server
          const syncResponse = await fetch('/api/qr-codes/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(qrData),
          });

          if (syncResponse.ok) {
            // Remove from cache after successful sync
            await cache.delete(request);
            console.log('[Service Worker] QR code synced successfully:', qrData.id);
          }
        } catch (error) {
          console.error('[Service Worker] Failed to sync QR code:', error);
        }
      }
    }
  } catch (error) {
    console.error('[Service Worker] Background sync failed:', error);
  }
}
