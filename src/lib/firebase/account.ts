import { deleteDoc, doc } from 'firebase/firestore';
import { deleteObject, listAll, ref } from 'firebase/storage';
import { deleteUser, type User } from 'firebase/auth';
import { db, storage } from '$lib/firebase/client';
import { resetSwipes } from '$lib/firebase/swipe';
import { activeTheme } from '$lib/stores/theme';
import { activeLanguage } from '$lib/stores/language';

// Wipes swipes, matches, chats, the profile doc and photos, then deletes the auth user itself.
export async function deleteAccount(user: User) {
    const uid = user.uid;

    await resetSwipes(uid);
    await deleteDoc(doc(db, 'users', uid));

    const avatarsList = await listAll(ref(storage, `avatars/${uid}`));
    await Promise.all(avatarsList.items.map((item) => deleteObject(item)));

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

