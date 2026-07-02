importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC82Rm71vFNNeYFrXZYpaqkvVY97hMZt-g",
  authDomain: "leave-tracker-d81a7.firebaseapp.com",
  projectId: "leave-tracker-d81a7",
  storageBucket: "leave-tracker-d81a7.firebasestorage.app",
  messagingSenderId: "723263075295",
  appId: "1:723263075295:web:9bf8e588528699bb42ca6a"
});

const messaging = firebase.messaging();

// 앱이 백그라운드/종료 상태일 때 알림 수신
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || '연차 관리';
  const options = {
    body: payload.notification?.body || '',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23FF571F"/><text x="50" y="60" font-size="60" text-anchor="middle" fill="white" font-weight="bold">✓</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23FF571F"/></svg>'
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./leave-manager.html');
    })
  );
});
