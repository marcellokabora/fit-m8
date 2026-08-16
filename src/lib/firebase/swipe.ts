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

// Great-circle distance between two coordinates, in km
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
	const R = 6371;
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLng = ((lng2 - lng1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(a));
}

export async function getDiscoverFeed(
	currentUid: string,
	activityFilter: string,
	formatFilter: ActivityFormat | '',
	levelFilter: SkillLevel | '',
	genderFilter: Gender | '' = '',
	sexualOrientationFilter: SexualOrientation | '' = '',
	minAge: number | null = null,
	maxAge: number | null = null,
	maxDistanceKm: number | null = null,
	currentCoords: { lat?: number; lng?: number } = {}
): Promise<UserProfile[]> {
	// Get users who we already swiped
	const sentSnap = await getDocs(collection(db, 'swipes', currentUid, 'sent'));
	const alreadySwiped = new Set(sentSnap.docs.map((d) => d.id));
	alreadySwiped.add(currentUid);

	let q = query(collection(db, 'users'), limit(20));
	const snap = await getDocs(q);

	const hasOrigin = currentCoords.lat !== undefined && currentCoords.lng !== undefined;

	const candidates: UserProfile[] = [];
	for (const d of snap.docs) {
		if (alreadySwiped.has(d.id)) continue;
		const data = d.data() as Omit<UserProfile, 'uid'>;

		if (genderFilter && data.gender !== genderFilter) continue;
		if (
			sexualOrientationFilter &&
			(data.orientation ?? 'straight') !== sexualOrientationFilter
		)
			continue;
		if (minAge !== null && data.age < minAge) continue;
		if (maxAge !== null && data.age > maxAge) continue;

		// Distance filter only applies when we know both locations; candidates without
		// coordinates can't be verified as out of range, so they're kept rather than dropped.
		if (maxDistanceKm !== null && hasOrigin && data.lat !== undefined && data.lng !== undefined) {
			const km = distanceKm(currentCoords.lat!, currentCoords.lng!, data.lat, data.lng);
			if (km > maxDistanceKm) continue;
		}

		// Activity filters must match the same activity entry.
		if (activityFilter || formatFilter || levelFilter) {
			const match = data.activities?.some(
				(a) =>
					(!activityFilter || a.id === activityFilter) &&
					(!formatFilter || a.format === formatFilter || a.format === 'all') &&
					(!levelFilter || a.level === levelFilter)
			);
			if (!match) continue;
		}
		candidates.push({ uid: d.id, ...data });
	}
	return candidates;
}

// Deletes every recorded swipe so previously liked/passed profiles reappear in the discover feed.
export async function resetSwipes(uid: string) {
	const sentSnap = await getDocs(collection(db, 'swipes', uid, 'sent'));
	const batch = writeBatch(db);
	sentSnap.docs.forEach((d) => batch.delete(d.ref));
	await batch.commit();
}
