self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('message', (event) => {
  if (!event.data) return
  const { type, title, body, tag } = event.data
  if (type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(title || 'UZALA', {
      body: body || '',
      tag: tag || 'uzala-default',
      icon: '/icon-512.png',
      badge: '/icon-512.png',
      vibrate: [200, 100, 200],
      requireInteraction: true,
    })
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const urlToOpen = '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      const existing = clientsList.find((c) => c.url === urlToOpen && 'focus' in c)
      if (existing) {
        existing.focus()
      } else {
        clients.openWindow(urlToOpen)
      }
    })
  )
})
