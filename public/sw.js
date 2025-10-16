// Service Worker for AquaMetrics PWA
const CACHE_NAME = 'aquametrics-v1'
const RUNTIME_CACHE = 'aquametrics-runtime-v1'

// Static assets to cache
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json', '/favicon.svg']

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache')
      return cache.addAll(STATIC_ASSETS)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== CACHE_NAME && name !== RUNTIME_CACHE
          })
          .map((name) => {
            console.log('Deleting old cache:', name)
            return caches.delete(name)
          }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - network-first strategy with fallback
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // Network-first strategy for API requests
  if (url.pathname.includes('/api/') || url.pathname.includes('.json')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response('Offline', { status: 503 })
          })
        }),
    )
    return
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        const responseClone = response.clone()
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseClone)
        })

        return response
      })
    }),
  )
})

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-history') {
    event.waitUntil(syncHistoryData())
  }
})

async function syncHistoryData() {
  // Placeholder for future sync logic
  console.log('Syncing history data...')
}

// Push notification support (future enhancement)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '新的水資源數據提醒',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  }

  event.waitUntil(self.registration.showNotification('AquaMetrics', options))
})
