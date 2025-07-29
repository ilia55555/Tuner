const CACHE_NAME = 'tuner-cache-v1';
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
  // External assets for full offline capability
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap',
  "https://esm.sh/react@^19.1.1",
  "https://esm.sh/react-dom@^19.1.1/client",
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      // Using { mode: 'no-cors' } for external resources to prevent installation errors
      const requests = URLS_TO_CACHE.map(url => new Request(url, { mode: 'no-cors' }));
      return cache.addAll(requests).catch(err => {
          console.error("Cache addAll failed. Some assets might be unavailable offline: ", err);
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found, otherwise fetch from network
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});