import { getAnalytics, isSupported } from 'firebase/analytics';
import { firebaseApp } from '$lib/firebase/client';

export async function initAnalytics(): Promise<void> {
    if (await isSupported()) {
        getAnalytics(firebaseApp);
    }
}