import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, firebaseApp, firebaseConfig } from '$lib/firebase/client';
import { PUBLIC_FIREBASE_VAPID_KEY } from '$env/static/public';

const SW_PATH = '/notifications/firebase-messaging-sw.js';
const SW_SCOPE = '/notifications/';

// last token obtained in this session, so disabling can remove the exact one we added
let activeToken: string | null = null;

export async function pushNotificationsSupported(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator))
        return false;
    return await isSupported();
}

async function registerMessagingServiceWorker() {
    const params = new URLSearchParams(firebaseConfig as unknown as Record<string, string>);
    return navigator.serviceWorker.register(`${SW_PATH}?${params}`, { scope: SW_SCOPE });
}

// Requests permission, obtains an FCM token and stores it on the user's profile.
// Returns false if the browser doesn't support push, or the user denies permission.
export async function enablePushNotifications(uid: string): Promise<boolean> {
    if (!(await pushNotificationsSupported())) return false;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const registration = await registerMessagingServiceWorker();
    const messaging = getMessaging(firebaseApp);
    const token = await getToken(messaging, {
        vapidKey: PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
    });
    if (!token) return false;

    activeToken = token;
    await updateDoc(doc(db, 'users', uid), { fcmTokens: arrayUnion(token) });

    // Foreground messages don't trigger the background handler, so show them ourselves.
    onMessage(messaging, (payload) => {
        const title = payload.notification?.title ?? 'Fit-M8';
        registration.showNotification(title, {
            body: payload.notification?.body,
            icon: '/icons/icon-192.png',
            data: payload.data
        });
    });

    return true;
}

// Removes this device's token so it stops receiving push notifications.
// Browsers don't allow revoking Notification permission from script, so the
// permission itself stays granted; only the server-side token is dropped.
export async function disablePushNotifications(uid: string): Promise<void> {
    if (!activeToken) return;
    await updateDoc(doc(db, 'users', uid), { fcmTokens: arrayRemove(activeToken) });
    activeToken = null;
}
