// Dedicated FCM service worker, registered at its own scope so it doesn't collide
// with the Workbox PWA service worker (which also registers at "/"). The Firebase
// project config isn't available in a static file, so it's passed via query params
// from the page that registers this worker (see $lib/firebase/notifications.ts).
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const params = new URL(self.location.href).searchParams;
firebase.initializeApp({
    apiKey: params.get('apiKey'),
    authDomain: params.get('authDomain'),
    projectId: params.get('projectId'),
    storageBucket: params.get('storageBucket'),
    messagingSenderId: params.get('messagingSenderId'),
    appId: params.get('appId')
});

// Take over from any older cached copy of this worker immediately, so devices with the
// app already open pick up notification payload/format changes right away instead of
// waiting for every tab to be closed first.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const { title, body, url } = payload.data ?? {};
    // No "badge" here: Android renders it as a solid-color silhouette using only the
    // icon's alpha channel, and icon-192.png is fully opaque, so it showed as a white square.
    self.registration.showNotification(title ?? 'FIT-M8', {
        body,
        icon: '/icons/icon-192.png',
        data: { url }
    });
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url ?? '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clientList) => {
            const existing = clientList.find((c) => new URL(c.url).pathname === url);
            if (existing) return existing.focus();
            return self.clients.openWindow(url);
        })
    );
});
