// A unique name for the cache, change this to force updates.
const CACHE_NAME = 'tuner-cache-v-final-7'; 

// A list of all the essential files the app needs to run offline.
// All paths are now explicitly relative to avoid cross-origin issues.
const URLS_TO_CACHE = [
  './',
  './index.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './constants.ts',
  './utils/musicUtils.ts',
  './hooks/usePitchDetection.ts',
  './components/Controls.tsx',
  './components/TunerDisplay.tsx',
  './components/FrequencyControl.tsx',
  './icon.svg',
  './manifest.json',
  // External assets for full offline capability
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap',
  'https://esm.sh/react@^19.1.1',
  'https://esm.sh/react-dom@^19.1.1/client',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];

// Event: install
// This is where we cache all the essential files for the app.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`[Service Worker] Caching all assets in ${CACHE_NAME}`);
        // Use {cache: 'reload'} to bypass the browser's HTTP cache for these requests.
        const cachePromises = URLS_TO_CACHE.map(urlToCache => {
            return cache.add(new Request(urlToCache, {cache: 'reload'}));
        });
        return Promise.all(cachePromises);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Caching failed:', error);
      })
  );
});

// Event: activate
// This is where we clean up old, unused caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all open clients immediately.
      return self.clients.claim();
    })
  );
});

// Event: fetch
// This is where we define how to handle network requests.
// We use a "Cache first, falling back to network" strategy.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return the cached response if it exists.
        if (cachedResponse) {
          return cachedResponse;
        }
        // Otherwise, fetch from the network.
        return fetch(event.request).then(networkResponse => {
            // We don't cache new requests on the fly here,
            // as all essentials are cached on install.
            return networkResponse;
        });
      })
  );
});