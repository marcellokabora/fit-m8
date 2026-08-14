import { writable, derived } from 'svelte/store';
import { auth, db } from '$lib/firebase/client';
import {
	onAuthStateChanged,
	signInWithPopup,
	GoogleAuthProvider,
	OAuthProvider,
	FacebookAuthProvider,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	type User
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { UserProfile } from '$lib/types';

function createAuthStore() {
	const { subscribe, set } = writable<User | null>(null);

	if (typeof window !== 'undefined') {
		onAuthStateChanged(auth, (user) => set(user));
	}

	return {
		subscribe,
		signInGoogle: () => signInWithPopup(auth, new GoogleAuthProvider()),
		signInApple: () => signInWithPopup(auth, new OAuthProvider('apple.com')),
		signInFacebook: () => signInWithPopup(auth, new FacebookAuthProvider()),
		signInEmail: (email: string, password: string) =>
			signInWithEmailAndPassword(auth, email, password),
		registerEmail: (email: string, password: string) =>
			createUserWithEmailAndPassword(auth, email, password),
		signOut: () => signOut(auth)
	};
}

export const authUser = createAuthStore();

export const isLoggedIn = derived(authUser, ($user) => $user !== null);

function createUserProfileStore() {
	const { subscribe, set, update } = writable<UserProfile | null>(null);

	return {
		subscribe,
		set,
		update,
		load: async (uid: string) => {
			const snap = await getDoc(doc(db, 'users', uid));
			if (snap.exists()) {
				set({ uid, ...(snap.data() as Omit<UserProfile, 'uid'>) });
				return true;
			}
			return false;
		},
		save: async (uid: string, data: Partial<UserProfile>) => {
			await setDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
			update((p) => ({ ...(p ?? ({ uid } as UserProfile)), ...data }));
		}
	};
}

export const userProfile = createUserProfileStore();

export const filterActivity = writable<string>('');
export const filterFormat = writable<'1v1' | '2v2' | ''>('');
