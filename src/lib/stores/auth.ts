import { writable, derived } from 'svelte/store';
import { auth, db } from '$lib/firebase/client';
import {
	onAuthStateChanged,
	signInWithPopup,
	GoogleAuthProvider,
	FacebookAuthProvider,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	sendEmailVerification,
	sendPasswordResetEmail,
	signInAnonymously,
	reload,
	signOut,
	type User
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteField, serverTimestamp } from 'firebase/firestore';
import { DEFAULT_DISTANCE_KM, type ActivityFormat, type Gender, type SexualOrientation, type SkillLevel, type UserProfile, type YesNoFilter } from '$lib/types';

// Sends the verification link back to our own app instead of Firebase's generic confirmation page
function verificationActionSettings() {
	return {
		url: typeof window !== 'undefined' ? `${window.location.origin}/discover?verified=1` : ''
	};
}

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
		registerEmail: async (email: string, password: string) => {
			const credential = await createUserWithEmailAndPassword(auth, email, password);
			// Google accounts arrive pre-verified; email/password accounts must confirm their inbox first
			await sendEmailVerification(credential.user, verificationActionSettings());
			return credential;
		},
		resetPassword: (email: string) => sendPasswordResetEmail(auth, email),
		// Dev-only fallback so onboarding/etc. can be tested without a real registered account
		signInTestUser: () => signInAnonymously(auth),
		resendVerificationEmail: () => {
			if (!auth.currentUser) throw new Error('Not signed in');
			return sendEmailVerification(auth.currentUser, verificationActionSettings());
		},
		// Re-reads the auth user from Firebase so `emailVerified` reflects a link the user just clicked
		refreshUser: async () => {
			if (!auth.currentUser) return false;
			await reload(auth.currentUser);
			set(auth.currentUser);
			return auth.currentUser.emailVerified;
		},
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
	}
}

export const userProfile = createUserProfileStore();

export const filterActivities = writable<string[]>([]);
export const filterFormat = writable<Exclude<ActivityFormat, 'all'> | ''>('');
export const filterLevel = writable<SkillLevel | ''>('');
export const filterGender = writable<Gender | ''>('');
export const filterSexualOrientation = writable<SexualOrientation | ''>('');
export const filterMinAge = writable<number | null>(null);
export const filterMaxAge = writable<number | null>(null);
export const filterMaxDistanceKm = writable<number | null>(DEFAULT_DISTANCE_KM);
export const filterSingle = writable<YesNoFilter>('');
export const filterTrainer = writable<YesNoFilter>('');
