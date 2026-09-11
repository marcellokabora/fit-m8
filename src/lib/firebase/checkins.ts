import {
    collection,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    writeBatch,
    onSnapshot,
    query,
    where,
    orderBy,
    Timestamp,
    type Unsubscribe
} from 'firebase/firestore';
import { db } from '$lib/firebase/client';
import { type Checkin, type CheckinJoinRequest, type UserProfile } from '$lib/types';

// Removes every join request left over from a previous check-in — deleting/overwriting the
// parent checkin doc does NOT cascade-delete its joinRequests subcollection.
async function clearJoinRequests(uid: string): Promise<void> {
    const snap = await getDocs(collection(db, 'checkins', uid, 'joinRequests'));
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
}

// Creates/overwrites the current user's check-in (one active check-in per user, doc id == uid).
export async function startCheckin(
    profile: Pick<UserProfile, 'uid' | 'displayName' | 'photos' | 'gender'>,
    activityId: string,
    lat: number,
    lng: number,
    durationHours: number
): Promise<void> {
    const now = Date.now();
    await clearJoinRequests(profile.uid);
    await setDoc(doc(db, 'checkins', profile.uid), {
        uid: profile.uid,
        activityId,
        lat,
        lng,
        displayName: profile.displayName,
        photos: profile.photos ?? [],
        gender: profile.gender ?? '',
        createdAt: Timestamp.fromMillis(now),
        expiresAt: Timestamp.fromMillis(now + durationHours * 60 * 60 * 1000)
    });
}

// Ends a check-in early; it would otherwise also stop appearing once expiresAt passes.
export async function endCheckin(uid: string): Promise<void> {
    await deleteDoc(doc(db, 'checkins', uid));
    await clearJoinRequests(uid);
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

// Adds the current user to a check-in's public "wants to join" list (doc id == requester's uid,
// so a repeat tap just overwrites their own entry instead of creating duplicates).
export async function requestToJoinCheckin(
    checkinUid: string,
    profile: Pick<UserProfile, 'uid' | 'displayName' | 'photos' | 'gender'>
): Promise<void> {
    await setDoc(doc(db, 'checkins', checkinUid, 'joinRequests', profile.uid), {
        uid: profile.uid,
        displayName: profile.displayName,
        photos: profile.photos ?? [],
        gender: profile.gender ?? '',
        createdAt: Timestamp.now(),
        status: 'pending'
    });
}

// Lets the check-in's owner accept or decline someone who asked to join.
export async function respondToJoinRequest(
    checkinUid: string,
    requesterUid: string,
    status: 'accepted' | 'declined'
): Promise<void> {
    await updateDoc(doc(db, 'checkins', checkinUid, 'joinRequests', requesterUid), { status });
}

// Removes a join request entirely — usable by the requester (to withdraw) or the check-in's
// owner (to remove someone from the list even after already accepting/declining them).
export async function cancelJoinRequest(checkinUid: string, requesterUid: string): Promise<void> {
    await deleteDoc(doc(db, 'checkins', checkinUid, 'joinRequests', requesterUid));
}

// Live-subscribes to everyone who has asked to join a check-in; anyone signed in can read it.
export function subscribeJoinRequests(
    checkinUid: string,
    onChange: (requests: CheckinJoinRequest[]) => void
): Unsubscribe {
    const q = query(collection(db, 'checkins', checkinUid, 'joinRequests'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
        const requests = snap.docs.map((d) => {
            const data = d.data();
            return { ...data, uid: d.id, createdAt: toDate(data.createdAt) } as CheckinJoinRequest;
        });
        onChange(requests);
    });
}
