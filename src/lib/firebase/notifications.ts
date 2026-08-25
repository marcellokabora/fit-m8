import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, setDoc, arrayUnion } from 'firebase/firestore';
import { db, firebaseApp, firebaseConfig } from '$lib/firebase/client';
import { PUBLIC_FIREBASE_VAPID_KEY } from '$env/static/public';

const SW_PATH = '/notifications/firebase-messaging-sw.js';
const SW_SCOPE = '/notifications/';

export async function pushNotificationsSupported(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator))
        return false;
    return await isSupported();
}

async function registerMessagingServiceWorker() {
    const params = new URLSearchParams(firebaseConfig as unknown as Record<string, string>);
    return navigator.serviceWorker.register(`${SW_PATH}?${params}`, { scope: SW_SCOPE });
}

function handleForegroundMessage(registration: ServiceWorkerRegistration, messaging: ReturnType<typeof getMessaging>) {
    // Foreground messages don't trigger the background handler, so show them ourselves.
    // Data-only payload (see functions/index.js) — a "notification" field would make the
    // browser auto-display it in addition to this call, showing it twice.
    onMessage(messaging, (payload) => {
        registration.showNotification(payload.data?.title ?? 'Fit-M8', {
            body: payload.data?.body,
            icon: '/icons/icon-192.png',
            data: { url: payload.data?.url }
        });
    });
}

// Requests permission and returns an FCM token, or null if unsupported/denied.
// Doesn't persist anything — the caller decides when/where to save the token
// (the user's Firestore doc may not exist yet, e.g. during onboarding).
export async function requestPushToken(): Promise<string | null> {
    if (!(await pushNotificationsSupported())) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const registration = await registerMessagingServiceWorker();
    const messaging = getMessaging(firebaseApp);
    const token = await getToken(messaging, {
        vapidKey: PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
    });
    if (!token) return null;

    handleForegroundMessage(registration, messaging);
    return token;
}

export async function savePushToken(uid: string, token: string): Promise<void> {
    await setDoc(doc(db, 'users', uid), { fcmTokens: arrayUnion(token) }, { merge: true });
}

// Re-attaches the foreground message listener on later app loads, for a device that
// already granted permission — doesn't re-prompt or write anything to Firestore.
// Re-registers (not just getRegistration) so the browser's update algorithm runs and
// picks up any new deploy of the SW script instead of running a stale cached copy
// indefinitely (browsers otherwise only re-check on their own ~24h schedule).
export async function initForegroundMessaging(): Promise<void> {
    if (!(await pushNotificationsSupported())) return;
    if (Notification.permission !== 'granted') return;

    const registration = await registerMessagingServiceWorker();
    handleForegroundMessage(registration, getMessaging(firebaseApp));
}

