import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '$lib/firebase/client';

export async function submitContactMessage(name: string, email: string, message: string) {
    await addDoc(collection(db, 'contactMessages'), {
        name: name.trim() || null,
        email: email.trim() || null,
        message: message.trim(),
        createdAt: serverTimestamp()
    });
}
