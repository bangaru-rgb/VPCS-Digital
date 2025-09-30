const CACHE_NAME = 'vpcs-digital-v' + new Date().getTime();
const urlsToCache = [
  '/VPCS-Digital/',
  '/VPCS-Digital/index.html',
  '/VPCS-Digital/manifest.json',
  '/VPCS-Digital/static/css/main.0034a4ab.css',
  '/VPCS-Digital/static/js/main.1ea4407d.js',
  '/VPCS-Digital/static/js/453.3dc873fd.chunk.js',
  '/VPCS-Digital/favicon.ico'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - network first with cache update and force refresh
self.addEventListener('fetch', (event) => {
  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response since we need to use it twice
        const responseToCache = response.clone();
        
        // Update the cache with the new response
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        // Force clients to reload when new version is available
        if (event.request.mode === 'navigate') {
          clients.claim().then(() => {
            clients.matchAll().then(clients => {
              clients.forEach(client => client.postMessage({ type: 'RELOAD' }));
            });
          });
        }

        return response;
      })
      .catch(() => {
        // If network request fails, try to get it from cache
        return caches.match(event.request);
        // Return cached version or fetch from network
        if (response) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return response;
        }
        
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses or chrome extensions
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Skip chrome-extension URLs for caching
          if (event.request.url.startsWith('chrome-extension://')) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // If both cache and network fail, show offline page
        console.log('Service Worker: Both cache and network failed');
        // You can return a custom offline page here
      })
  );
});