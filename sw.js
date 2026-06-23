// My Money Manager - Service Worker for Push Notifications
const CACHE = 'mmm-v1';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });

// Handle push events
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const opts = {
    body: data.body || 'Payment due soon',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.tag || 'mmm-payment',
    renotify: true,
    requireInteraction: true,
    actions: [
      { action: 'view', title: '👀 View bills' },
      { action: 'snooze', title: '💤 Snooze 1 day' }
    ],
    data: data
  };
  e.waitUntil(self.registration.showNotification(data.title || 'My Money Manager', opts));
});

// Handle notification clicks
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'snooze') {
    // Post message to client to handle snooze
    e.waitUntil(
      clients.matchAll({ type: 'window' }).then(cls => {
        cls.forEach(c => c.postMessage({ type: 'SNOOZE', tag: e.notification.tag }));
      })
    );
  } else {
    e.waitUntil(clients.openWindow('/'));
  }
});

// Schedule local notifications via setTimeout (works without push server)
self.addEventListener('message', e => {
  if (e.data.type === 'SCHEDULE') {
    const { delay, title, body, tag } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        tag,
        requireInteraction: true,
        actions: [
          { action: 'view', title: '👀 View bills' },
          { action: 'snooze', title: '💤 Snooze 1 day' }
        ]
      });
    }, delay);
  }
});
