import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '$lib/firebase/client';

const HEARTBEAT_MS = 20_000;

// Marks this user as "actively using the app" so Cloud Functions can skip push
// notifications for events the client will already show live via Firestore listeners.
// Returns a cleanup function that stops the heartbeat (call on logout/unmount).
export function startPresenceHeartbeat(uid: string): () => void {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    function ping() {
        updateDoc(doc(db, 'users', uid), { lastActiveAt: serverTimestamp() }).catch(() => { });
    }

    function startInterval() {
        if (intervalId) return;
        ping();
        intervalId = setInterval(ping, HEARTBEAT_MS);
    }

    function stopInterval() {
        if (!intervalId) return;
        clearInterval(intervalId);
        intervalId = null;
    }

    // Pause the heartbeat while the tab is hidden/backgrounded so "lastActiveAt"
    // goes stale and the recipient is treated as offline again.
    function handleVisibilityChange() {
        if (document.visibilityState === 'visible') startInterval();
        else stopInterval();
    }

    if (document.visibilityState === 'visible') startInterval();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
        stopInterval();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
}
