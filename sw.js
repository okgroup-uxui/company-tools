const CACHE_NAME = 'leave-tracker-v1';
const urlsToCache = [
  './',
  './leave-manager.html',
  './manifest.json'
];

// Install 이벤트
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate 이벤트
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch 이벤트 - 네트워크 우선, 캐시 폴백
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 유효한 응답은 캐시에 저장
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 가져오기
        return caches.match(event.request)
          .then(response => {
            return response || caches.match('./leave-manager.html');
          });
      })
  );
});

// 백그라운드 동기
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // 데이터 동기화 로직
      Promise.resolve()
    );
  }
});

// 푸시 알림
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || '알림이 있습니다',
    icon: 'data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 192 192%27><rect fill=%27%23FF571F%27 width=%27192%27 height=%27192%27/><text x=%2796%27 y=%27140%27 font-size=%27100%27 text-anchor=%27middle%27 fill=%27white%27 font-weight=%27bold%27>✓</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 192 192%27><circle cx=%2796%27 cy=%2796%27 r=%2796%27 fill=%27%23FF571F%27/></svg>',
    tag: data.tag || 'notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '연차 관리', options)
  );
});

// 알림 클릭
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        // 이미 열린 창이 있으면 포커스
        for (let client of clientList) {
          if (client.url === './' && 'focus' in client) {
            return client.focus();
          }
        }
        // 없으면 새로 열기
        if (clients.openWindow) {
          return clients.openWindow('./leave-manager.html');
        }
      })
  );
});
