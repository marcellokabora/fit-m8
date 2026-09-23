import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '$lib/firebase/client';

export async function submitPremiumRequest(uid: string) {
    await addDoc(collection(db, 'premiumRequests'), {
        uid,
        createdAt: serverTimestamp()
    });
}
