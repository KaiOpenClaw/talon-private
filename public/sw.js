// Talon Service Worker - PWA functionality
const CACHE_NAME = 'talon-v1'
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
]

// Install event - cache initial resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  )
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
    }).then(() => self.clients.claim())
  )
})

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  // Only handle GET requests for same origin
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return
  }

  // API requests - try network first, fallback to cache for essential endpoints
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful responses for essential API endpoints
          if (response.ok && (
            event.request.url.includes('/api/agents') ||
            event.request.url.includes('/api/sessions') ||
            event.request.url.includes('/api/status')
          )) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached version if network fails
          return caches.match(event.request)
        })
    )
    return
  }

  // Static resources - cache first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(event.request)
          .then(response => {
            // Cache successful responses for static resources
            if (response.ok && response.status === 200) {
              const responseClone = response.clone()
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone)
              })
            }
            return response
          })
      })
  )
})

// Background sync for message sending (future enhancement)
self.addEventListener('sync', event => {
  if (event.tag === 'send-message') {
    event.waitUntil(
      // Handle background message sending when back online
      console.log('Background sync: send-message')
    )
  }
})

// Push notifications (future enhancement)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'talon-notification',
      data: data
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Talon', options)
    )
  }
})

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close()
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // If Talon is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus()
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
  )
})