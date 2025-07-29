const CACHE_NAME = 'tuner-cache-v2';
// Add the new Babel script to the cache list
const URLS_TO_CACHE = [
  '/',
  'index.html',
  'index.tsx',
  'App.tsx',
  'types.ts',
  'constants.ts',
  'utils/musicUtils.ts',
  'hooks/usePitchDetection.ts',
  'components/Controls.tsx',
  'components/TunerDisplay.tsx',
  'components/FrequencyControl.tsx',
  'assets/icon.svg',
  'manifest.json',
  // External assets for full offline capability
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap',
  "https://esm.sh/react@^19.1.1",
  "https://esm.sh/react-dom@^19.1.1/client",
  "https://unpkg.com/@babel/standalone/babel.min.js"
];

// On install, cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache and caching assets');
      return cache.addAll(URLS_TO_CACHE);
    }).then(() => {
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting();
    })
  );
});

// On activate, clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        // Tell the active service worker to take control of the page immediately.
        return self.clients.claim();
    })
  );
});


// On fetch, use a robust "network falling back to cache" strategy for navigation
// and "cache first" for other assets.
self.addEventListener('fetch', (event) => {
    // For HTML navigation requests, try the network first to get the latest version.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // If network is available, cache the new response for offline use.
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
                .catch(() => {
                    // If network fails, serve the page from the cache.
                    return caches.match(event.request);
                })
        );
        return;
    }

    // For all other requests (assets like JS, CSS, images), serve from cache first for speed.
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached response if found.
            if (response) {
                return response;
            }
            // Otherwise, fetch from the network.
            return fetch(event.request);
        })
    );
});
