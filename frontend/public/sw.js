const CACHE_NAME = 'finance-tracker-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/vite.svg',
]

// Install event - cache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.log('Cache addAll error:', err)
      })
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first strategy with cache fallback
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  const { request } = event

  // Network first strategy
  event.respondWith(
    fetch(request)
      .then(response => {
        // Don't cache API responses
        if (request.url.includes('/api/')) {
          return response
        }

        // Cache successful responses
        if (response && response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone)
          })
        }

        return response
      })
      .catch(() => {
        // Fallback to cache on network error
        return caches.match(request).then(response => {
          if (response) {
            return response
          }

          // Return a custom offline page or placeholder
          if (request.destination === 'document') {
            return new Response(
              '<html><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
              {
                headers: { 'Content-Type': 'text/html' },
              }
            )
          }

          return new Response('Resource not available offline')
        })
      })
  )
})

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
