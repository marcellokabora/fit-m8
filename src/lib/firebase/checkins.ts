import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    Timestamp,
    type Unsubscribe
} from 'firebase/firestore';
import { db } from '$lib/firebase/client';
import { CHECKIN_DURATION_MS, type Checkin, type UserProfile } from '$lib/types';

// Creates/overwrites the current user's check-in (one active check-in per user, doc id == uid).
export async function startCheckin(
    profile: Pick<UserProfile, 'uid' | 'displayName' | 'photoURL' | 'gender'>,
    activityId: string,
    lat: number,
    lng: number,
    message?: string
): Promise<void> {
    const now = Date.now();
    await setDoc(doc(db, 'checkins', profile.uid), {
        uid: profile.uid,
        activityId,
        lat,
        lng,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        gender: profile.gender ?? '',
        createdAt: Timestamp.fromMillis(now),
        expiresAt: Timestamp.fromMillis(now + CHECKIN_DURATION_MS),
        // omit rather than write `undefined` — the Firestore SDK rejects undefined field values
        ...(message ? { message } : {})
    });
}

// Ends a check-in early; it would otherwise also stop appearing once expiresAt passes.
export async function endCheckin(uid: string): Promise<void> {
    await deleteDoc(doc(db, 'checkins', uid));
}

function toDate(val: unknown): Date {
    if (val && typeof val === 'object' && 'toDate' in val) return (val as Timestamp).toDate();
    return new Date();
}

// Live-subscribes to every currently-active (non-expired) check-in; returns an unsubscribe fn.
export function subscribeActiveCheckins(onChange: (checkins: Checkin[]) => void): Unsubscribe {
    const q = query(collection(db, 'checkins'), where('expiresAt', '>', Timestamp.now()));
    return onSnapshot(q, (snap) => {
        const checkins = snap.docs.map((d) => {
            const data = d.data();
            return {
                ...data,
                uid: d.id,
                createdAt: toDate(data.createdAt),
                expiresAt: toDate(data.expiresAt)
            } as Checkin;
        });
        onChange(checkins);
    });
}
