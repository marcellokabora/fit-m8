import { writable, derived } from 'svelte/store';
import { auth, db } from '$lib/firebase/client';
import {
	onAuthStateChanged,
	signInWithPopup,
	GoogleAuthProvider,
	FacebookAuthProvider,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	type User
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteField, serverTimestamp } from 'firebase/firestore';
import { DEFAULT_DISTANCE_KM, type ActivityFormat, type Gender, type SexualOrientation, type SkillLevel, type UserProfile } from '$lib/types';

function createAuthStore() {
	// undefined = auth state not yet resolved (still reading persisted session)
	const { subscribe, set } = writable<User | null | undefined>(undefined);

	if (typeof window !== 'undefined') {
		onAuthStateChanged(auth, (user) => set(user));
	}

	return {
		subscribe,
		signInGoogle: () => signInWithPopup(auth, new GoogleAuthProvider()),
		signInFacebook: () => signInWithPopup(auth, new FacebookAuthProvider()),
		signInEmail: (email: string, password: string) =>
			signInWithEmailAndPassword(auth, email, password),
		registerEmail: (email: string, password: string) =>
			createUserWithEmailAndPassword(auth, email, password),
		signOut: () => signOut(auth)
	};
}

export const authUser = createAuthStore();

export const isLoggedIn = derived(authUser, ($user) => !!$user);

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
			// Firestore rejects explicit `undefined` values, so translate them to field deletions
			const firestoreData: Record<string, unknown> = {};
			for (const [key, value] of Object.entries(data)) {
				firestoreData[key] = value === undefined ? deleteField() : value;
			}
			await setDoc(
				doc(db, 'users', uid),
				{ ...firestoreData, updatedAt: serverTimestamp() },
				{ merge: true }
			);
			update((p) => ({ ...(p ?? ({ uid } as UserProfile)), ...data }));
		}
	};
}

export const userProfile = createUserProfileStore();

export const filterActivity = writable<string>('');
export const filterFormat = writable<Exclude<ActivityFormat, 'all'> | ''>('');
export const filterLevel = writable<SkillLevel | ''>('');
export const filterGender = writable<Gender | ''>('');
export const filterSexualOrientation = writable<SexualOrientation | ''>('');
export const filterMinAge = writable<number | null>(null);
export const filterMaxAge = writable<number | null>(null);
export const filterMaxDistanceKm = writable<number | null>(DEFAULT_DISTANCE_KM);
