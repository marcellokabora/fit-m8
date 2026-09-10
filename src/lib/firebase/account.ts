import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { deleteObject, listAll, ref } from 'firebase/storage';
import { deleteUser, type User } from 'firebase/auth';
import { db, storage } from '$lib/firebase/client';
import { resetSwipes } from '$lib/firebase/swipe';
import { activeTheme } from '$lib/stores/theme';
import { activeLanguage } from '$lib/stores/language';

// Deletes every match (and its chat thread) this user is part of, so no orphaned data referencing
// a deleted uid is left behind for the other participant to stumble over.
async function deleteMatchesAndChats(uid: string) {
    const matchesSnap = await getDocs(query(collection(db, 'matches'), where('userIds', 'array-contains', uid)));
    for (const matchDoc of matchesSnap.docs) {
        const messagesSnap = await getDocs(collection(db, 'chats', matchDoc.id, 'messages'));
        await Promise.all(messagesSnap.docs.map((m) => deleteDoc(m.ref)));
        await deleteDoc(matchDoc.ref);
    }
}

// Wipes swipes, matches, chats, the profile doc and photos, then deletes the auth user itself.
// Each cleanup step is best-effort (failures are logged, not thrown) so a hiccup in one of them
// - e.g. a storage list/delete error - can't leave the account undeletable; the profile doc
// removal and the auth deletion itself are the only steps allowed to fail the whole operation.
export async function deleteAccount(user: User) {
    const uid = user.uid;

    const cleanupSteps: [string, () => Promise<unknown>][] = [
        ['resetSwipes', () => resetSwipes(uid)],
        ['deleteMatchesAndChats', () => deleteMatchesAndChats(uid)],
        [
            'deleteAvatars',
            async () => {
                const avatarsList = await listAll(ref(storage, `avatars/${uid}`));
                await Promise.all(avatarsList.items.map((item) => deleteObject(item)));
            }
        ]
    ];
    for (const [name, step] of cleanupSteps) {
        try {
            await step();
        } catch (err) {
            console.error(`deleteAccount: ${name} failed, continuing anyway`, err);
        }
    }

    await deleteDoc(doc(db, 'users', uid));
    await deleteUser(user);

    activeTheme.reset();
    activeLanguage.reset();
    // Catch-all for any other locally cached preferences (e.g. the "intro seen" flag) tied to this browser.
    if (typeof window !== 'undefined') {
        for (const key of Object.keys(window.localStorage)) {
            if (key.startsWith('fit-m8-')) window.localStorage.removeItem(key);
        }
    }
}

// Admin-only: wipes another user's profile doc + stored photos. Does not touch their Firebase
// Auth account — client SDKs can only delete the *currently signed-in* user, not an arbitrary
// one, so removing the Auth account itself would require a server-side (Admin SDK) function.
export async function adminDeleteUserData(uid: string) {
    await deleteDoc(doc(db, 'users', uid));

    const avatarsList = await listAll(ref(storage, `avatars/${uid}`));
    await Promise.all(avatarsList.items.map((item) => deleteObject(item)));
}

