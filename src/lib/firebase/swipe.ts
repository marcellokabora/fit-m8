import {
	collection,
	doc,
	setDoc,
	getDoc,
	query,
	where,
	getDocs,
	serverTimestamp,
	limit,
	writeBatch
} from 'firebase/firestore';
import { db } from '$lib/firebase/client';
import type {
	ActivityFormat,
	Gender,
	SexualOrientation,
	SkillLevel,
	UserProfile
} from '$lib/types';
import { distanceKm } from '$lib/location';

export async function recordSwipe(
	fromUid: string,
	toUid: string,
	direction: 'like' | 'pass',
	activity: string,
	format: ActivityFormat
) {
	await setDoc(doc(db, 'swipes', fromUid, 'sent', toUid), {
		direction,
		activity,
		format,
		timestamp: serverTimestamp()
	});

	if (direction === 'like') {
		// Check if the other user already liked us back
		const reverseSnap = await getDoc(doc(db, 'swipes', toUid, 'sent', fromUid));
		if (reverseSnap.exists() && reverseSnap.data().direction === 'like') {
			await createMatch(fromUid, toUid, activity, format);
			return true; // it's a match!
		}
	}
	return false;
}

async function createMatch(uid1: string, uid2: string, activity: string, format: ActivityFormat) {
	const matchId = [uid1, uid2].sort().join('_');
	await setDoc(
		doc(db, 'matches', matchId),
		{
			userIds: [uid1, uid2],
			activity,
			format,
			status: 'confirmed',
			createdAt: serverTimestamp()
		},
		{ merge: true }
	);
}

export async function getDiscoverFeed(
	currentUid: string,
	myActivityIds: string[],
	activityFilter: string,
	formatFilter: ActivityFormat | '',
	levelFilter: SkillLevel | '',
	genderFilter: Gender | '' = '',
	sexualOrientationFilter: SexualOrientation | '' = '',
	minAge: number | null = null,
	maxAge: number | null = null,
	maxDistanceKm: number | null = null,
	currentCoords: { lat?: number; lng?: number } = {},
	singleFilter: boolean = false,
	trainerFilter: boolean = false
): Promise<UserProfile[]> {
	// Get users who we already swiped
	const sentSnap = await getDocs(collection(db, 'swipes', currentUid, 'sent'));
	const alreadySwiped = new Set(sentSnap.docs.map((d) => d.id));
	alreadySwiped.add(currentUid);

	let q = query(collection(db, 'users'), limit(20));
	const snap = await getDocs(q);

	const hasOrigin = currentCoords.lat !== undefined && currentCoords.lng !== undefined;
	// "All sports" means any sport we ourselves practice, not literally any sport on the platform
	const relevantActivityIds = activityFilter ? [activityFilter] : myActivityIds;

	const candidates: UserProfile[] = [];
	for (const d of snap.docs) {
		if (alreadySwiped.has(d.id)) continue;
		const data = d.data() as Omit<UserProfile, 'uid'>;

		// Unverified email/password accounts stay hidden from Discover until they confirm their inbox;
		// `undefined` means the profile predates this field (or is a Google account), so it's kept.
		if (data.emailVerified === false) continue;

		if (genderFilter && data.gender !== genderFilter) continue;
		if (
			sexualOrientationFilter &&
			(data.orientation ?? 'hetero') !== sexualOrientationFilter
		)
			continue;
		if (minAge !== null && data.age < minAge) continue;
		if (maxAge !== null && data.age > maxAge) continue;
		if (singleFilter && !data.isSingle) continue;
		if (trainerFilter && !data.isTrainer) continue;

		// Distance filter only applies when we know both locations; candidates without
		// coordinates can't be verified as out of range, so they're kept rather than dropped.
		if (maxDistanceKm !== null && hasOrigin && data.lat !== undefined && data.lng !== undefined) {
			const km = distanceKm(currentCoords.lat!, currentCoords.lng!, data.lat, data.lng);
			if (km > maxDistanceKm) continue;
		}

		// Candidate must share one of our own sports (or the specifically chosen one), matching format/level too.
		const match = data.activities?.some(
			(a) =>
				relevantActivityIds.includes(a.id) &&
				(!formatFilter || a.format === formatFilter || a.format === 'all') &&
				(!levelFilter || a.level === levelFilter)
		);
		if (!match) continue;
		candidates.push({ uid: d.id, ...data });
	}
	return candidates;
}


// Deletes every recorded swipe and match so previously liked/passed profiles reappear in the discover feed.
export async function resetSwipes(uid: string) {
	const sentSnap = await getDocs(collection(db, 'swipes', uid, 'sent'));
	const matchesSnap = await getDocs(
		query(collection(db, 'matches'), where('userIds', 'array-contains', uid))
	);

	// Chat messages live in a separate top-level collection, so clear each thread before the match doc is gone.
	for (const matchDoc of matchesSnap.docs) {
		const messagesSnap = await getDocs(collection(db, 'chats', matchDoc.id, 'messages'));
		if (messagesSnap.empty) continue;
		const messagesBatch = writeBatch(db);
		messagesSnap.docs.forEach((m) => messagesBatch.delete(m.ref));
		await messagesBatch.commit();
	}

	const batch = writeBatch(db);
	sentSnap.docs.forEach((d) => batch.delete(d.ref));
	matchesSnap.docs.forEach((d) => batch.delete(d.ref));
	await batch.commit();
}
