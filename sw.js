// CIO Portal Service Worker
const CACHE_NAME = 'cio-portal-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/admin-login.html',
  '/admin-dashboard.html',
  '/manifest.json',
  '/cio-logo.jpg',
  '/bago-city-logo.png'
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', event => {
  // Skip non-GET and Supabase/external requests
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('supabase.co') ||
    event.request.url.includes('googleapis.com') ||
    event.request.url.includes('jsdelivr.net')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
